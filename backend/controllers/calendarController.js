const Assignment = require('../models/assignmentModel');
const Task = require('../models/taskModel');
const Class = require('../models/classModel');
const Project = require('../models/projectModel');

const getCalendarEvents = async (req, res) => {
  try {
    const userId = req.user._id;
    const events = [];

    // --- 1. LẤY DEADLINE BÀI TẬP (ASSIGNMENTS) ---
    // Tìm các lớp mà user này là thành viên (SV) hoặc giảng viên (GV)
    let classIds = [];
    if (req.user.role === 'lecturer') {
        const classes = await Class.find({ lecturer: userId }).select('_id');
        classIds = classes.map(c => c._id);
    } else {
        const classes = await Class.find({ student: userId }).select('_id');
        classIds = classes.map(c => c._id);
    }

    const assignments = await Assignment.find({ class: { $in: classIds } })
        .populate('class', 'name');

    // Format dữ liệu Assignment chuẩn để trả về
    assignments.forEach(ass => {
        events.push({
            id: ass._id,
            title: `[Bài tập] ${ass.title}`,
            start: ass.dueDate,
            end: ass.dueDate,
            type: 'assignment', // Để frontend tô màu đỏ
            className: ass.class?.name,
            description: ass.description
        });
    });

    // --- 2. LẤY DEADLINE TASK (CÔNG VIỆC NHÓM) ---
    // Chỉ lấy task được giao cho chính user này (nếu là SV)
    // Hoặc task của các nhóm do user này làm Leader (nếu muốn)
    // Ở đây ta lấy task được giao (assignedTo)
    const tasks = await Task.find({ assignedTo: userId })
        .populate('project', 'name');

    tasks.forEach(task => {
        if (task.dueDate) { // Chỉ lấy task có hạn chót
            events.push({
                id: task._id,
                title: `[Task] ${task.title}`,
                start: task.dueDate,
                end: task.dueDate,
                type: 'task', // Để frontend tô màu xanh
                projectName: task.project?.name,
                description: task.description,
                status: task.status
            });
        }
    });

    res.json(events);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCalendarEvents };