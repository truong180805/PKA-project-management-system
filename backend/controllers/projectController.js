const User = require('../models/userModel');
const Project = require('../models/projectModel');
const Class = require('../models/classModel');

//create project function
const createProject = async (req, res) => {
    try{
        const {name, description, classId } = req.body;
        
        const classItem = await Class.findById(classId);
        if(!classItem) {
            return res.status(404).json({ message: 'Lớp không tồn tại'});
        }
        
        const existingProject = await Project.findOne({
            class: classId,
            members: req.user._id
        })
        
        if (existingProject) {
            return res.status(400).json({ message: 'Bạn đã tham gia một nhóm trong lớp này rồi'});
        }

        const newProject = await Project.create({
            name,
            description,
            class: classId,
            members: [req.user._id],
            leader: req.user._id,
            status: 'pending'
        })
        
        res.status(201).json(newProject);
    } catch (error) {
        res.status(500).json({ message: error.message});
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

        const alreadyInGroup = await Project.findOneAndDelete({
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
    try{
        const { id } = req.params;
        const { status, feedback } = req.body;

        if (req.user.role !== 'lecturer') {
            return res.status(403).json({ message: 'Chỉ giảng viên mới được duyệt đề tài'})
        }

        const project = await Project.findByIdAndUpdate(
            id,
            { status, lecturerFeedback: feedback },
            { new: true }
        );

        if (!project) return res.status(404).json({ message: 'Nhóm không tồn tại'});

        res.json({ message: `Đã cập nhật trạng thái: ${status}`, project });
    }catch(error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    createProject,
    getProjectsByClass,
    approveProject,
    joinProject,
    getProjectDetails
};
