const Class = require('../models/classModel');
const Project = require('../models/projectModel');
const Task = require('../models/taskModel');

const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const isLecturer = req.user.role === 'lecturer';
    
        let stats = {};

        if (isLecturer) {
            //total my classes
            const totalClasses = await Class.countDocuments({ lecturer: userId });

            const myClasses = await Class.find({ lecturer: userId }).select('_id');
            const classIds = myClasses.map(c => c._id);

            const totalProjects = await Project.countDocuments({ class: { $in: classIds } });

            const pendingProjects = await Project.countDocuments({ 
                class: { $in: classIds }, 
                status: 'pending' 
            });

            stats = {
                totalClasses,
                totalProjects,
                pendingProjects,
                role: 'lecturer'
            };
        } else {
            //for student
            const totalClasses = await Class.countDocuments({ student: userId });

            const pendingTasks = await Task.countDocuments({ 
                assignedTo: userId,
                status: { $in: ['todo', 'in_progress'] }
            });

            const upcomingTasks = await Task.find({
                assignedTo: userId,
                status: { $ne: 'completed' }, // Khác completed
                dueDate: { $ne: null }       // Có hạn chót
            })
            .sort({ dueDate: 1 }) // Tăng dần (hạn gần nhất lên đầu)
            .limit(5)
            .populate('project', 'name');

            stats = {
                totalClasses,
                totalProjects,
                pendingTasks,
                upcomingTasks,
                role: 'student'
            };
        }

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboardStats };