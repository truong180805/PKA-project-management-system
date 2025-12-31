const { findOne } = require("../models/userModel");

const Class = required('../model/classModel');

const generateClassCode = () => {
    return Math.random().toString(36).substring(2,8).toUpperCase();
};

const createClass = async (req, res) => {
    try{
        const { name, semester, description, settings } = req.body;

        if (req.user.role !== 'lecturer'){
            return res.status(403).json({ message: 'Chỉ giảng viên mới có quyền tạo lớp'});
        }

        let classCode;
        let codeExists;
        do {
            classCode = generateClassCode();
            codeExists = await Class.findOne({ classCode });
        } while (codeExists);

        const newClass = await Class.creat({
            name,
            semester,
            description,
            classCode,
            lecturer: req.user._id,
            settings: {
                autoApprove: settings?.autoApprove || false,
                allowStudentPropose: settings?.allowStudentPropose || true
            }
        });

        res.status(201).json(newClass);
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
}

module.exports ={
    createClass
};