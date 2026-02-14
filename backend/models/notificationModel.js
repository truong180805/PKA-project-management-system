const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  type: { 
    type: String, 
    enum: ['assignment', 'grade', 'system', 'chat'], 
    default: 'system' 
  },
  message: { type: String, required: true },
  link: { type: String }, // Đường dẫn khi click vào (VD: /classes/123/grades)
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);