const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    
    // Đề tài thuộc lớp nào
    class: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Class', 
        required: true 
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },

    // Số lượng nhóm tối đa được đăng ký đề tài này
    maxGroups: { type: Number, default: 1 },

    // Danh sách các nhóm đã đăng ký thành công
    registeredGroups: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    }],

    requestQueue: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],

    // Trạng thái (VD: Đã đầy, Còn trống)
    isFull: { type: Boolean, default: false }

}, { timestamps: true});

module.exports = mongoose.model('Topic', topicSchema);