const Task = require('../models/taskModel');
const Project = require('../models/projectModel');

//create task function
const createTask = async (req, res) => {
    try{
        const { projectId, 
                title, 
                description, 
                assignedTo,
                dueDate 
            } = req.body;

        const project = await Project.findById(projectId);
        if (!project.members.includes(req.user._id)) {
            res.status('403').json({message: 'Bạn không phải thành viên của nhóm'});
        }

        const newTask = await Task.create({
            project: projectId, title, description,
            assignedTo: assignedTo || req.user._id, dueDate,
            status: 'todo'
        });

        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
};

const getTaskByProject = async (req, res) => {
    try {
        const { projectId } = req.params;

        const tasks = await Task.find({project: projectId})
            .populate('assignedTo', 'fullname avatarUrl');
        
        res.json(tasks);
    } catch(error) {
        res.status(500).json({message: error.message});
    }
};

const updateTask = async (req, res) => {
    try{
        const {id} = req.params;
        const { title, description, status, submissionLink, assignedTo, dueDate } = req.body;

        const task = await Task.findById(id);
        if (!task) return res.status(404).json({ message: 'Task không tồn tại' });

        if (title) task.title = title;
        if (description) task.description = description;
        if (status) task.status = status;
        if (submissionLink) task.submissionLink = submissionLink;
        if (assignedTo) task.assignedTo = assignedTo;
        if (dueDate) task.dueDate = dueDate;

        await task.save();
        
        // Populate lại thông tin người được gán để trả về frontend hiển thị ngay
        const updatedTask = await Task.findById(id).populate('assignedTo', 'fullName avatarUrl');
        
        res.json(updatedTask);
    } catch(error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteTask = async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.json({ message: 'Đã xóa task'});
    } catch (erro) {
        res.json(500).status({ messag: error.message});
    }
};

const submitProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { finalReportUrl } = req.body;

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: 'Nhóm không tồn tại' });

    // Check quyền Leader
    if (project.leader.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Chỉ nhóm trưởng mới được nộp bài' });
    }

    project.finalReportUrl = finalReportUrl;
    await project.save();

    res.json({ message: 'Nộp đồ án thành công', project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
    createTask,
    getTaskByProject,
    updateTask,
    deleteTask,
    submitProject
};
