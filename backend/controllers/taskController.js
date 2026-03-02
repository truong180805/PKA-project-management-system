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

        const task = await Task.create({
            project: projectId, title, description,
            assignedTo: assignedTo || req.user._id, dueDate,
            status: 'todo'
        });

        await updateProjectProgress(task.project);

        res.status(201).json(task);
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
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        
        if (task) {
            // Lấy ID dự án chính xác từ Task vừa cập nhật
            const projId = task.project || task.projectId; 
            await updateProjectProgress(projId);
        }
        
        res.json(task);
    } catch (error) { 
        res.status(500).json({ message: error.message }); 
    }
};

const deleteTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Không tìm thấy task' });
        }

        await updateProjectProgress(task.project);

        res.json({ message: 'Đã xóa task' });
    } catch (error) {
        res.status(500).json({ message: error.message });
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

const updateProjectProgress = async (projectID) => {
    if (!projectID) return;

    // 1. Dùng $or để đếm đúng dù Model của bạn đặt tên là 'project' hay 'projectId'
    const totalTasks = await Task.countDocuments({ 
        $or: [{ project: projectID }, { projectId: projectID }] 
    });
    
    const completedTasks = await Task.countDocuments({ 
        $or: [{ project: projectID }, { projectId: projectID }], 
        status: 'completed' // Đảm bảo status bạn lưu là 'completed'
    });

    // 2. Tính % tiến độ
    const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    // 3. Tự động chuyển đổi trạng thái Hoàn Thành
    const project = await Project.findById(projectID);
    if (project) {
        let newStatus = project.status;
        
        if (progress === 100 && project.status === 'approved') {
            newStatus = 'completed'; // Xong 100% -> Hoàn thành
        } else if (progress < 100 && project.status === 'completed') {
            newStatus = 'approved'; // Bị lùi tiến độ -> Quay lại Đang thực hiện
        }

        // Cập nhật vào Database
        await Project.findByIdAndUpdate(projectID, { 
            progress: progress,
            status: newStatus 
        });
    }
};

module.exports = {
    createTask,
    getTaskByProject,
    updateTask,
    deleteTask,
    submitProject
};
