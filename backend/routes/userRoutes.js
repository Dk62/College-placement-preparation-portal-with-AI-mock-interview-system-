const express = require('express');
const { updateUserSettings, changePassword } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.put('/update-settings', protect, updateUserSettings);
router.put('/change-password', protect, changePassword);

module.exports = router;
