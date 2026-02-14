const Assignment = require('../models/assignmentModel');
const Task = require('../models/taskModel');
const Class = require('../models/classModel');

const getCalendarEvents = async (req, res) => {
  try {
    const userId = req.user._id;
    const isLecturer = req.user.role === 'lecturer';
    const events = [];

    // --- 1. LẤY DANH SÁCH LỚP ---
    let query = isLecturer ? { lecturer: userId } : { student: userId };
    const classes = await Class.find(query).select('_id name');
    const classIds = classes.map(c => c._id);

    // --- 2. LẤY DEADLINE BÀI TẬP (ASSIGNMENTS) ---
    // Cả GV và SV đều cần xem hạn nộp bài tập
    const assignments = await Assignment.find({ class: { $in: classIds } })
        .populate('class', 'name');

    assignments.forEach(ass => {
        events.push({
            id: ass._id,
            title: isLecturer ? `[Thu bài] ${ass.title}` : `[Nộp bài] ${ass.title}`, // Đổi tiêu đề cho hợp vai
            start: ass.dueDate,
            end: ass.dueDate,
            type: 'assignment',
            classId: ass.class?._id, // <--- QUAN TRỌNG ĐỂ LỌC
            className: ass.class?.name,
            description: ass.description,
            color: '#cf1322' // Màu đỏ cho deadline
        });
    });

    // --- 3. LẤY DEADLINE TASK (CHỈ DÀNH CHO SV) ---
    // GV thường không quan tâm task nhỏ lẻ của từng nhóm, trừ khi muốn xem chi tiết
    // Ở đây ta chỉ trả task cho SV để lịch GV đỡ rác
    if (!isLecturer) {
        const tasks = await Task.find({ assignedTo: userId })
            .populate('project', 'name');

        tasks.forEach(task => {
            if (task.dueDate) {
                events.push({
                    id: task._id,
                    title: `[Task] ${task.title}`,
                    start: task.dueDate,
                    end: task.dueDate,
                    type: 'task',
                    projectName: task.project?.name,
                    description: task.description,
                    color: '#1890ff' // Màu xanh cho task
                });
            }
        });
    }

    res.json(events);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCalendarEvents };