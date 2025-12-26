const Task = require('../models/taskModel');
const Project = require('../models/projectModel');

//create task function
const createTask = async (req, res) => {
    try{
        const { projectId, title, description, assignedTo, dueDate } = req.body;

        const project = await Project.findById(projectId);
        if (!project) {
            res.status('404').json({message: 'Không tìm thấy đồ án'});
        }

        const isMember = project.member.some(memberId => memberId.toString() === req.user._id.toString());
        const isMentor = project.mentor && project.metor.toString() == req.user._id.toString();

        if (!isMember && !Mentor) {
            res.status(403).json({message: 'Bạn không phải thành viên của nhóm này'});
        }
        const task = await Task.create({
            project: projectId, title, description,
            assignedTo: assigentTo || req.user._id,dueDate,
            status: 'todo'
        });

        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({message: 'Lỗi tạo task', error: error.message});
    }
};

    const getTaskByProject = async (req, res) => {
        try {
            const { projectId } = req.params;

            const task = await Task.find({project: projectId})
                .populate('assignedTo', 'fullname email studenId');
            
            req.json(tasks);
        } catch(error) {
            res.status(500).json({message: error.message});
        }
    };

module.exports = {
    createTask,
    getTaskByProject
};
