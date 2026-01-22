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

const updateTaskStatus = async (req, res) => {
    try{
        const {id} = req.params;
        const { status, submissionLink } = req.body;

        const task = await Task.findById(id);
        if (!task) return res.status(404).json({ message: 'Task không tồn tại'});

        if (status) task.status = status;
        if (submissionLink) task.submissionLink = submissionLink;

        await task.save();
        res.json(task);
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

module.exports = {
    createTask,
    getTaskByProject,
    updateTaskStatus,
    deleteTask
};
