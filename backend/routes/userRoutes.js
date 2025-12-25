const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/userController');

const { protect } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.post('/login', loginUser);

//ex check token

router.get('/profile', protect, (req, res) => {
  
  res.json({
    message: 'Bạn đã vào được khu vực bảo mật!',
    userInfo: req.user, 
  });
});

module.exports = router;