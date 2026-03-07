const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  
  class: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Class', 
    required: true 
  },

  dueDate: { type: Date, required: true },

  attachmentUrl: { type: String },

}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);