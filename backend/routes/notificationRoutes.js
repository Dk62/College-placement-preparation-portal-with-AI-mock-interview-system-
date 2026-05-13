const express = require('express');
const { getMyNotifications, markAllAsRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getMyNotifications);
router.put('/mark-read', protect, markAllAsRead);

module.exports = router;
