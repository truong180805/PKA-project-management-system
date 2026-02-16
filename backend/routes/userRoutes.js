const express = require('express');
const router = express.Router();
const { registerUser, loginUser,updateUserProfile,
        resetPassword, forgotPassword
 } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.post('/login', loginUser);
router.put('/profile', protect, updateUserProfile);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

//ex check token
router.get('/profile', protect, (req, res) => {
  
  res.json({
    message: 'Bạn đã vào được khu vực bảo mật!',
    userInfo: req.user, 
  });
});

module.exports = router;