const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getAdminStats,
  getAllUsers,
  deleteUser,
  getQuestionBank,
  addQuestion,
  deleteQuestion,
  getAuditLogs
} = require('../controllers/adminController');

// Lock every single route in this file strictly to Admin ROLE.
router.use(protect);
router.use(authorize('Admin'));

// Paths
router.get('/stats', getAdminStats);
router.get('/logs', getAuditLogs);

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

router.get('/questions', getQuestionBank);
router.post('/questions', addQuestion);
router.delete('/questions/:id', deleteQuestion);

module.exports = router;
