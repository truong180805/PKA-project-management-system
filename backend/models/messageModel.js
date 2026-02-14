const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  content: { type: String, required: true },

  // ID của cuộc hội thoại (Có thể là ClassID, ProjectID, hoặc ID riêng tư)
  conversationId: { type: mongoose.Schema.Types.ObjectId, required: true },

  // Loại hội thoại để Frontend dễ hiển thị icon
  type: { 
    type: String, 
    enum: ['class', 'project', 'private'], 
    default: 'class' 
  },

  // (Tùy chọn) Người nhận nếu là chat riêng (để lọc tin nhắn riêng)
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }

}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);