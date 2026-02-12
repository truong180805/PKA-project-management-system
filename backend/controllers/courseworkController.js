const Assignment = require('../models/assignmentModel');
const Submission = require('../models/submissionModel');
const Material = require('../models/materialModel');
const Topic = require('../models/topicModel');
const Project = require('../models/projectModel');

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
        }, { new: true });
        
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
        if (req.user.role !== 'lecturer') return res.status(403).json({ message: 'Không có quyền' });
        
        const topic = await Topic.create({ name, description, class: classId, maxGroups });
        res.status(201).json(topic);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const getTopics = async (req, res) => {
    try {
        const list = await Topic.find({ class: req.params.classId }).populate('registeredGroups', 'name');
        res.json(list);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const registerTopic = async (req, res) => {
    try {
        // Logic: SV chọn đề tài -> Hệ thống tự tạo Project (Nhóm) tương ứng với đề tài đó
        // HOẶC: Project đã có sẵn, Leader chọn đề tài để gán vào.
        // Theo flow của bạn: "đề xuất đề tài để giảng viên duyệt" -> có vẻ Project tạo trước.
        
        // Cách triển khai: Project Leader chọn Topic
        const { topicId, projectId } = req.body;
        
        const topic = await Topic.findById(topicId);
        const project = await Project.findById(projectId);

        if (!topic || !project) return res.status(404).json({ message: 'Không tìm thấy' });
        
        if (topic.isFull || topic.registeredGroups.length >= topic.maxGroups) {
            return res.status(400).json({ message: 'Đề tài này đã đủ số lượng nhóm đăng ký' });
        }

        // Cập nhật
        topic.registeredGroups.push(projectId);
        if (topic.registeredGroups.length >= topic.maxGroups) {
            topic.isFull = true;
        }
        await topic.save();

        // Gán tên đề tài vào description của project hoặc tạo trường topicRef trong Project (nếu cần)
        project.description = `[Đề tài: ${topic.name}] ${project.description || ''}`;
        await project.save();

        res.json({ message: 'Đăng ký đề tài thành công', topic });

    } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = {
    createAssignment, getAssignmentsByClass,
    submitAssignment, getSubmissions, gradeSubmission,
    uploadMaterial, getMaterials,
    createTopic, getTopics, registerTopic
};