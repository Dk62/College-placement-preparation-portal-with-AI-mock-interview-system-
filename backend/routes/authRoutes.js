const express = require('express');
const { 
  register, 
  login, 
  getMe, 
  logout, 
  googleLogin,
  forgotPassword,
  resetPassword 
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

// Anti brute-force shielding (Max 5 attempts / 15 min)
const recoveryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: {
    success: false,
    message: 'Too many recovery attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', protect, getMe);
router.post('/logout', logout);

// Secure Recovery Channels
router.post('/forgot-password', recoveryLimiter, forgotPassword);
router.post('/reset-password', recoveryLimiter, resetPassword);

module.exports = router;
