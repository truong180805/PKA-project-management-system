const Class = require('../models/classModel');
const Project = require('../models/projectModel');
const Task = require('../models/taskModel');
// const Assignment = require('../models/assignmentModel'); // Nếu bạn muốn thống kê thêm bài tập

const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const isLecturer = req.user.role === 'lecturer';

        let stats = {};

        if (isLecturer) {
            // --- THỐNG KÊ CHO GIẢNG VIÊN ---
            // 1. Số lớp đang dạy
            const myClasses = await Class.find({ lecturer: userId }).select('_id name');
            const classIds = myClasses.map(c => c._id);
            stats.totalClasses = classIds.length;

            // 2. Lấy TẤT CẢ các nhóm thuộc các lớp của GV này
            const allProjects = await Project.find({ class: { $in: classIds } }).populate('class', 'name');
            stats.totalProjects = allProjects.length;
            
            // 3. Nhóm đang chờ duyệt
            const pendingProjects = allProjects.filter(p => p.status === 'pending');
            stats.pendingApprovalsCount = pendingProjects.length;
            stats.pendingProjectsList = pendingProjects.slice(0, 5);

            // --- ĐÂY LÀ PHẦN SỬA LẠI LOGIC TIẾN ĐỘ ---
            // Chỉ lấy các nhóm ĐANG THỰC HIỆN (Bỏ qua completed, rejected)
            const ongoingProjects = allProjects.filter(p => p.status === 'approved');
            
            // Gom nhóm tiến độ theo từng Lớp
            const classProgressMap = {};
            ongoingProjects.forEach(p => {
                const className = p.class.name;
                if (!classProgressMap[className]) {
                    classProgressMap[className] = { totalProgress: 0, count: 0 };
                }
                classProgressMap[className].totalProgress += (p.progress || 0);
                classProgressMap[className].count += 1;
            });

            // Biến Object Map thành mảng để trả về cho Frontend
            const classProgressList = Object.keys(classProgressMap).map(className => ({
                name: className,
                progress: Math.round(classProgressMap[className].totalProgress / classProgressMap[className].count)
            }));

            // Trả về danh sách tiến độ của từng lớp
            stats.classProgressList = classProgressList;
        } else {
            // --- THỐNG KÊ CHO SINH VIÊN ---
            // 1. Số lớp đang học
            stats.totalClasses = await Class.countDocuments({ student: userId });

            // 2. Số nhóm tham gia & Tiến độ trung bình
            const myProjects = await Project.find({ members: userId }).populate('class', 'name');
            stats.totalProjects = myProjects.length;
            
            const totalProgress = myProjects.reduce((sum, p) => sum + (p.progress || 0), 0);
            stats.averageProgress = myProjects.length > 0 ? Math.round(totalProgress / myProjects.length) : 0;
            stats.myProjectsList = myProjects.slice(0, 4); // Lấy 4 nhóm để hiện thẻ nhanh

            // 3. Công việc sắp đến hạn (Task)
            const upcomingTasks = await Task.find({ 
                assignedTo: userId, 
                status: { $in: ['todo', 'in_progress'] } 
            })
            .sort({ dueDate: 1 }) // Sắp xếp hạn chót gần nhất lên đầu
            .limit(5)
            .populate('project', 'name');
            
            stats.upcomingTasks = upcomingTasks;
        }

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboardStats };