const Assignment = require('../models/assignmentModel');
const Submission = require('../models/submissionModel');
const Material = require('../models/materialModel');
const Topic = require('../models/topicModel');
const Project = require('../models/projectModel');
const Class = require('../models/classModel');
const Notification = require('../models/notificationModel');

// --- 1. XỬ LÝ ASSIGNMENT (BÀI TẬP) ---
const createAssignment = async (req, res) => {
  try {
    const { title, description, classId, dueDate, attachmentUrl } = req.body;
    // Check quyền GV (có thể thêm logic check owner class)
    if (req.user.role !== 'lecturer') return res.status(403).json({ message: 'Chỉ giảng viên mới được tạo bài tập' });

    const newAss = await Assignment.create({ title, description, class: classId, dueDate, attachmentUrl });
    res.status(201).json(newAss);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getAssignmentsByClass = async (req, res) => {
  try {
    const list = await Assignment.find({ class: req.params.classId }).sort({ dueDate: 1 });
    res.json(list);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- 2. XỬ LÝ SUBMISSION (NỘP BÀI) ---
const submitAssignment = async (req, res) => {
  try {
    const { assignmentId, submissionUrl, note, projectId } = req.body;
    
    // Kiểm tra xem đã nộp chưa, nếu rồi thì update
    let sub = await Submission.findOne({ assignment: assignmentId, submitter: req.user._id });
    
    if (sub) {
        sub.submissionUrl = submissionUrl;
        sub.note = note;
        sub.project = projectId; // Nếu có
        await sub.save();
    } else {
        sub = await Submission.create({
            assignment: assignmentId,
            submitter: req.user._id,
            project: projectId,
            submissionUrl,
            note
        });
    }
    res.json({ message: 'Nộp bài thành công', sub });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getSubmissions = async (req, res) => { // GV xem danh sách bài nộp
  try {
    const { assignmentId } = req.params;
    const list = await Submission.find({ assignment: assignmentId })
        .populate('submitter', 'fullName studentId')
        .populate('project', 'name');
    res.json(list);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const gradeSubmission = async (req, res) => { // GV chấm điểm
    try {
        const { submissionId } = req.params;
        const { score, feedback } = req.body;
        
        if (req.user.role !== 'lecturer') return res.status(403).json({ message: 'Không có quyền' });

        const sub = await Submission.findByIdAndUpdate(submissionId, {
            score, feedback, gradedAt: new Date()
        }, { new: true }).populate('assignment', 'title class');

        const newNotif = await Notification.create({
            recipient: sub.submitter, // Gửi cho sinh viên nộp bài
            sender: req.user._id,
            type: 'grade',
            message: `Giảng viên đã chấm điểm bài tập: ${sub.assignment.title}`,
            link: `/classes/${sub.assignment.class}/grades` // Link đến trang điểm số
        });

        const io = req.app.get('io');
        io.to(sub.submitter.toString()).emit('receive_notification', newNotif);
        
        res.json(sub);
    } catch (error) { res.status(500).json({ message: error.message }); }
}

// --- 3. XỬ LÝ MATERIAL (TÀI LIỆU) ---
const uploadMaterial = async (req, res) => {
    try {
        const { title, description, classId, fileUrl } = req.body;
        if (req.user.role !== 'lecturer') return res.status(403).json({ message: 'Không có quyền' });
        
        const mat = await Material.create({ title, description, class: classId, fileUrl, uploadedBy: req.user._id });
        res.status(201).json(mat);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const getMaterials = async (req, res) => {
    try {
        const list = await Material.find({ class: req.params.classId }).sort({ createdAt: -1 });
        res.json(list);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- 4. XỬ LÝ TOPIC (ĐỀ TÀI) ---
const createTopic = async (req, res) => {
    try {
        const { name, description, classId, maxGroups } = req.body;
        
        // Nếu là GV: Duyệt luôn (approved). Nếu SV: Chờ duyệt (pending)
        const status = req.user.role === 'lecturer' ? 'approved' : 'pending';

        const topic = await Topic.create({ 
            name, 
            description, 
            class: classId, 
            maxGroups: maxGroups || 1,
            createdBy: req.user._id,
            status: status
        });
        res.status(201).json(topic);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const getTopics = async (req, res) => {
    try {
        const list = await Topic.find({ class: req.params.classId })
            .populate('registeredGroups', 'name')
            .populate('requestQueue', 'name') // Lấy tên nhóm đang chờ
            .populate('createdBy', 'fullName') // Lấy tên người tạo
            .sort({ createdAt: -1 });
        res.json(list);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const registerTopic = async (req, res) => {
    try {
        const { topicId, projectId } = req.body;
        
        const topic = await Topic.findById(topicId);
        const project = await Project.findById(projectId);

        if (!topic || !project) return res.status(404).json({ message: 'Không tìm thấy' });
        
        // Check trùng
        if (topic.requestQueue.includes(projectId) || topic.registeredGroups.includes(projectId)) {
            return res.status(400).json({ message: 'Nhóm đã đăng ký hoặc đang chờ duyệt đề tài này' });
        }

        // Vào hàng chờ
        topic.requestQueue.push(projectId);
        await topic.save();

        res.json({ message: 'Đã gửi yêu cầu đăng ký, vui lòng chờ giảng viên duyệt', topic });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const approveTopicProposal = async (req, res) => {
    try {
        const { topicId, isApproved } = req.body; // true/false
        if (req.user.role !== 'lecturer') return res.status(403).json({message: 'Không có quyền'});

        const topic = await Topic.findById(topicId);
        if(!topic) return res.status(404).json({message: 'Không tìm thấy'});

        if (isApproved) {
            topic.status = 'approved';
        } else {
            // Nếu từ chối thì xóa luôn hoặc set status rejected
            await Topic.findByIdAndDelete(topicId); 
            return res.json({ message: 'Đã từ chối và xóa đề xuất' });
        }
        await topic.save();
        res.json({ message: 'Đã duyệt đề tài', topic });
    } catch (error) { res.status(500).json({message: error.message}); }
};

const approveTopicRegistration = async (req, res) => {
    try {
        const { topicId, projectId, isApproved } = req.body;
        if (req.user.role !== 'lecturer') return res.status(403).json({message: 'Không có quyền'});

        const topic = await Topic.findById(topicId);
        if(!topic) return res.status(404).json({message: 'Topic not found'});

        // Xóa khỏi hàng chờ dù duyệt hay từ chối
        topic.requestQueue = topic.requestQueue.filter(pid => pid.toString() !== projectId);

        if (isApproved) {
             // Check full
             if (topic.registeredGroups.length >= topic.maxGroups) {
                 return res.status(400).json({ message: 'Đề tài đã đầy!' });
             }
             
             topic.registeredGroups.push(projectId);
             if(topic.registeredGroups.length >= topic.maxGroups) topic.isFull = true;
             
             // Cập nhật tên Project theo Topic luôn cho đồng bộ
             const project = await Project.findById(projectId);
             project.description = `[Đề tài: ${topic.name}] ${project.description || ''}`;
             await project.save();
        }

        await topic.save();
        res.json({ message: isApproved ? 'Đã duyệt nhóm vào đề tài' : 'Đã từ chối nhóm', topic });

    } catch (error) { res.status(500).json({message: error.message}); }
};

const getClassGradebook = async (req, res) => {
    try {
        const { classId } = req.params;

        const assignments = await Assignment.find({ class: classId })
            .select('_id title dueDate')
            .sort({ createdAt: 1 })
            .lean();

        const classInfo = await Class.findById(classId)
            .populate('student', 'fullName studentId avatarUrl')
            .lean();

        if (!classInfo)
            return res.status(404).json({ message: 'Lớp không tồn tại' });

        const assignmentIds = assignments.map(a => a._id);

        const submissions = await Submission.find({
            assignment: { $in: assignmentIds }
        }).lean();

        const submissionMap = {};
        submissions.forEach(sub => {
            const key = `${sub.submitter}_${sub.assignment}`;
            submissionMap[key] = sub;
        });

        const gradebook = classInfo.student.map(student => {
            const grades = {};
            let totalScore = 0;
            let submittedCount = 0;

            assignments.forEach(assign => {
                const key = `${student._id}_${assign._id}`;
                const sub = submissionMap[key];

                grades[assign._id] = {
                    submitted: !!sub,
                    score: sub?.score,
                    feedback: sub?.feedback,
                    submissionUrl: sub?.submissionUrl
                };

                if (sub?.score != null) {
                    totalScore += sub.score;
                    submittedCount++;
                }
            });

            return {
                _id: student._id,
                studentId: student.studentId,
                fullName: student.fullName,
                avatarUrl: student.avatarUrl,
                grades,
                averageScore: submittedCount > 0
                    ? Number((totalScore / submittedCount).toFixed(1))
                    : null
            };
        });

        res.json({ assignments, students: gradebook });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    createAssignment, getAssignmentsByClass,
    submitAssignment, getSubmissions, gradeSubmission,
    uploadMaterial, getMaterials,
    createTopic, getTopics, registerTopic,
    approveTopicProposal,
    approveTopicRegistration, getClassGradebook
};