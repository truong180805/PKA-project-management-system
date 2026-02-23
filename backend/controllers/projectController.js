const Topic = require('../models/projectModel');
const Project = require('../models/projectModel');
const Class = require('../models/classModel');

//create project function
const createProject = async (req, res) => {
  try {
    // Nhận dữ liệu từ Frontend gửi lên
    const { name, description, classId, topicId, proposedTopic } = req.body;

    if (!name || !classId) {
        return res.status(400).json({ message: 'Vui lòng điền đủ tên nhóm và chọn lớp' });
    }

    // Kiểm tra xem sinh viên đã có nhóm trong lớp này chưa
    const existingProject = await Project.findOne({ class: classId, members: req.user._id });
    if (existingProject) {
        return res.status(400).json({ message: 'Bạn đã tham gia một nhóm trong lớp này rồi' });
    }

    let finalTopicId = topicId;

    // NẾU SINH VIÊN ĐỀ XUẤT ĐỀ TÀI MỚI (Không chọn có sẵn)
    if (proposedTopic && proposedTopic.name) {
        const newTopic = await Topic.create({
            name: proposedTopic.name,
            description: proposedTopic.description,
            class: classId,
            createdBy: req.user._id,
            status: 'pending' // Đề tài mới phải chờ duyệt
        });
        finalTopicId = newTopic._id;
    }

    if (!finalTopicId) {
        return res.status(400).json({ message: 'Vui lòng chọn đề tài hoặc đề xuất đề tài mới' });
    }

    // Tạo Nhóm mới, gắn với Topic ID vừa xử lý
    const project = await Project.create({
      name,
      description,
      class: classId,
      topic: finalTopicId,
      leader: req.user._id,
      members: [req.user._id],
      status: 'pending' // Nhóm luôn chờ GV duyệt
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProjectsByClass = async (req, res) => {
    try{
        const { classId } = req.params;

        const projects = await Project.find({ class: classId })
        .populate('leader', 'fullName numberPhone')
        .populate('members', 'fullName studentId avatarUrl')
        .sort({createdAt: -1});

        res.json(projects);
    } catch (error){
        res.status(500).json({message: error.message});
    }
};

const getProjectDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project.findById(id)
            .populate('leader', 'fullName email')
            .populate('members', 'fullName email studentId avatarUrl');

        if(!project) return res.status(404).json({ message: 'Không tìm thấy nhóm'});

        res.json(project);
    } catch(error) {
        res.status(500).json({ message: error.message });
    }
};

const joinProject = async (req, res) => {
    try {
        const { projectId } = req.body;
        const project = await Project.findById(projectId);
        
        if (!project) {
            return res.status(404).json({ message: 'Nhóm không tồn tại'});
        }

        if (project.members.includes(req.user._id)) {
            return res.status(400).json({ message: 'Bạn đã ở trong nhóm này rồi'});
        }

        const alreadyInGroup = await Project.findOne({
            class: project.class,
            members: req.user._id
        })
        if (alreadyInGroup) {
        return res.status(400).json({ message: 'Bạn đã có nhóm khác trong lớp này' });
        }

        project.members.push(req.user._id);
        await project.save();

        res.json({ message: 'Tham gia nhóm thành công', project});
    } catch(error) {
        res.status(500).json({ message: error.message });
    }
};

const approveProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Nhận 'approved' hoặc 'rejected'

    // Lấy nhóm và populate luôn thông tin topic của nó
    const project = await Project.findById(id).populate('topic');
    
    if (!project) return res.status(404).json({ message: 'Không tìm thấy nhóm' });

    // Cập nhật trạng thái nhóm
    project.status = status;
    await project.save();

    // LOGIC THÔNG MINH: Nếu Duyệt nhóm, tự động Duyệt luôn đề tài nhóm đó đang giữ (nếu đề tài đó đang pending)
    if (status === 'approved' && project.topic && project.topic.status === 'pending') {
        await Topic.findByIdAndUpdate(project.topic._id, { status: 'approved' });
    }

    res.json({ message: `Đã ${status === 'approved' ? 'duyệt' : 'từ chối'} nhóm thành công`, project });
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

const getMyProjects = async (req, res) => {
  try {
    // Tìm các project mà user là thành viên
    const projects = await Project.find({ members: req.user._id })
      .populate('class', 'name classCode') // Lấy thêm tên lớp để hiển thị
      .populate('leader', 'fullName')
      .sort({ updatedAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSupervisedProjects = async (req, res) => {
  try {
    // 1. Tìm tất cả lớp mà GV này dạy
    const myClasses = await Class.find({ lecturer: req.user._id }).select('_id');
    const classIds = myClasses.map(c => c._id);

    // 2. Tìm tất cả Project thuộc các lớp đó
    const projects = await Project.find({ class: { $in: classIds } })
      .populate('class', 'name classCode')
      .populate('leader', 'fullName studentId')
      .populate('members', 'fullName avatarUrl')
      .sort({ updatedAt: -1 });

    // (Nâng cao: Có thể tính toán % hoàn thành task ở đây nếu muốn, tạm thời ta trả về list project thô)
    
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
    createProject,
    getProjectsByClass,
    approveProject,
    joinProject,
    getProjectDetails,
    submitProject,
    getMyProjects,
    getSupervisedProjects
};
