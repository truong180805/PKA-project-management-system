const Message = require('../models/messageModel');
const Class = require('../models/classModel');
const Project = require('../models/projectModel');
const User = require('../models/userModel');

// --- 1. LẤY DANH SÁCH HỘI THOẠI (CHAT ROOMS) ---
const getConversations = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.user._id;
    const isLecturer = req.user.role === 'lecturer';

    const conversations = [];

    const [classes, projects] = await Promise.all([
      isLecturer
        ? Class.find({ lecturer: userId }).select('name _id')
        : Class.find({ student: userId }).select('name _id'),

      isLecturer
        ? [] 
        : Project.find({ members: userId }).select('name _id')
    ]);

    // Class conversations
    classes.forEach(c => {
      conversations.push({
        id: c._id,
        name: `[Lớp] ${c.name}`,
        type: 'class',
        avatar: null
      });
    });

    // Project conversations
    projects.forEach(p => {
      conversations.push({
        id: p._id,
        name: `[Nhóm] ${p.name}`,
        type: 'project',
        avatar: null
      });
    });

    return res.status(200).json(conversations);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};


// --- 2. LẤY NỘI DUNG TIN NHẮN CỦA 1 HỘI THOẠI ---
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const messages = await Message.find({ conversationId })
      .populate('sender', 'fullName avatarUrl role')
      .sort({ createdAt: 1 }); 

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 3. GỬI TIN NHẮN ---
const sendMessage = async (req, res) => {
  try {
    const { conversationId, content, type, receiverId } = req.body;

    const newMessage = await Message.create({
      sender: req.user._id,
      content,
      conversationId,
      type,
      receiver: receiverId 
    });

    const populatedMsg = await Message.findById(newMessage._id).populate('sender', 'fullName avatarUrl');

    res.status(201).json(populatedMsg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getConversations, getMessages, sendMessage };