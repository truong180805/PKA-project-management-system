const Class = require('../models/classModel');

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

        const newClass = await Class.create({
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
};

const getMyClasses = async (req, res) => {
    try{
        let classes;
        
        if (req.user.role === 'lecturer') {
            classes = await Class 
                .find({ lecturer: req.user._id })
                .sort({ createdAt: -1 });
        } else if (req.user.role === 'student') {
            classes = await Class
                .find({ student: req.user._id })
                .sort({ createdAt: -1 });
        }

        res.json(classes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const joinClass = async (req, res) => {
    try{
        const { classCode } = req.body;
        const studentId = req.user._id;

        const classItem = await Class.findOne({ classCode });
        if (!classItem) {
            return res.status(404).json({ message: 'Lớp không tồn tại'});
        }
        const isJoined = classItem.student.some(
            id => id.equals(studentId)
        );
        const isPending = classItem.pendingStudents.some(
            id => id.equals(studentId)
        );

        if (isJoined){
            return res.status(400).json({ message: 'Bạn đã là thành viên của lớp'});
        }
        if (isPending){
            return res.status(400).json({ message: 'Bạn đã gửi yêu cầu, vui lòng chờ'});
        }

        if (classItem.settings.autoApprove) {
            classItem.student.addToSet(studentId);
            await classItem.save();
            return res.status(200).json({ message: 'Tham gia lớp thành công', status: 'joined'});
        } else {
            classItem.pendingStudents.addToSet(studentId);
            await classItem.save();
            return res.status(200).json({ message: 'Đã gửi yêu cầu tham gia, chờ duyệt', status: 'pending'});
        }
    } catch(error) {
        res.status(500).json({ message: error.message });
    }
};

const getClassDetails = async (req, res) =>{
    try{
        const { id } = req.params;

        const classItem = await Class.findById(id)
            .populate('lecturer', 'fullName')
            .populate('studenr', 'fullName numberPhone studentId email')
            .populate('pending', 'fullName numberPhone studentId email');

        if (!classItem) {
            return res.status(404).json({ message: 'Lớp không tồn tại'});
        }

        const isLecturer = classItem.lecturer._id.equals(req.user._id);
        const isStudent = classItem.student.some(s => s._id.equals(req.user._id));

        if (!isLecturer && !isStudent && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Bạn không có quyền xem lớp này' });
        }

        res.json(classItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const approveStudent = async (req, res) => {
    try{
        const {id} = req.params;
        const {studentId, isApproved} = req.body;

        const classItem = await Class.findById(id);

        if(!classItem){
            return res.status(404).json({ message: 'Lớp không tồn tại'});
        }

        const isPending = classItem.pendingStudents.some(
        id => id.equal(studentId)
        );

        if(classItem.lecturer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Chỉ giảng viên mới được duyệt'});
        }

        if(!isPending) {
            return res.status(400).json({ message: 'Sinh viên này không nằm trong danh sách chờ'});
        }

        if (isApproved) {
        classItem.pendingStudents = classItem.pendingStudents.filter(
            id => id.toString() !== studentId
        );
        classItem.student.push(studentId);
        } else {
        classItem.pendingStudents = classItem.pendingStudents.filter(
            id => id.toString() !== studentId
        );
        }

        await classItem.save();
        res.json({ message: isApproved ? 'Đã duyệt sinh viên' : 'Đã từ chối'});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports ={
    createClass,
    getMyClasses,
    joinClass,
    getClassDetails,
    approveStudent
};