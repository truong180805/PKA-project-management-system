const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  content: { type: String, required: true },

  conversationId: { type: mongoose.Schema.Types.ObjectId, required: true },

  type: { 
    type: String, 
    enum: ['class', 'project', 'private'], 
    default: 'class' 
  },

  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }

}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);