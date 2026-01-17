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
            class: classCode,
            members: req.user._id
        })
        
        if (existingProject) {
            return res.status(400).json({ message: 'Bạn đã tham gia một nhóm trong lớp này rồi'});
        }

        const project = await Project.create({
            name,
            description,
            class: classId,
            members: [req.user._id],
            leader: req.user._id,
            status: 'pending'
        })
        
        res.status(201).json(project);
    } catch (error) {
        res.status(400).json({ message: error.message});
    }
};

const getProjectsByClass = async (req, res) => {
    try{

        const projects = await Project.find()
        .populate('leader', 'fullName email studentId')
        .populate('mentor', 'fullName email');

        res.json(projects);
    } catch (error){
        res.status(500).json({message: error.message});
    }
};

const findProjectById = async (req, res) => {
    try{
        const { classCode } = req.params;

        const projects = await Project.find({ class: classId })
            .populate('leader', 'fullName')
            .populate('members', 'fullName studentId avatarUrl');

        res.json(projects);
    } catch (error){
        res.status(500).json({message: error.message});
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

        project.members.push(req.user._id);
        await project.save();

        res.json({ message: 'Tham gia nhóm thành công', project});
    } catch(error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createProject,
    getProjectsByClass,
    findProjectById,
    joinProject
};
