const User = require('../models/userModel');
const Project = require('../models/projectModel');

//create project function
const createProject = async (req, res) => {
    try{
        const {name, description, semester, mentorId } = req.body;

        const currentUser = req.user;
        let projectData = {
            name,
            description,
            semester,
        };
        
        if (currentUser.role === 'student') {
            if(!mentorId){
                return res.status(400).json({message: 'Vui lòng chọn giảng viên'});
            }

            projectData.isStudentProposed = true;
            projectData.status = 'pending_approval';
            projectData.leader = currentUser._id;
            projectData.members = [currentUser._id];
            projectData.mentor = mentorId;
        }
        else if(currentUser.role === 'lecturer'){
            projectData.isStudentProposed = false;
            projectData.status = 'planning';
            projectData.mentor  = currentUser._id;
        }
        else {
            return res.status(403).json({message: 'Bạn không có quyền tạo đề tài'});
        }

        const project = await Project.create(projectData);
        const fullProject = await Project.findById(project._id)
        .populate('leader', 'fullName email')
        .populate('mentor', 'fullName email');

        res.status(201).json(fullProject);
    } catch (error) {
        res.status(400).json({message: 'Tạo đề tài thất bại', error: error.message});
    }
};

const getProjects = async (req, res) => {
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
        const project = await Project.findById(req.params.id)
        .populate('members', 'fullName email studentId')
        .populate('leader', 'fullName email studentId')
        .populate('mentor', 'fullName email');

        if(project){
            res.json(project);
        }else{
            res.status(404).json({message: 'không tìm thấy đề tài'});
        }
    } catch (error){
        res.status(500).json({message: error.message});
    }
};

module.exports = {
    createProject,
    getProjects,
    findProjectById
};
