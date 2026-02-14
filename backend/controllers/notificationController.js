const Notification = require('../models/notificationModel');

// Lấy danh sách thông báo của user hiện tại
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20); // Chỉ lấy 20 thông báo mới nhất
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Đánh dấu đã đọc
const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Đánh dấu tất cả đã đọc
const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany({ recipient: req.user._id }, { isRead: true });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { getNotifications, markAsRead, markAllAsRead };