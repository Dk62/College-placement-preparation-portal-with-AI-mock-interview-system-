const express = require('express');
const { startSession, submitResponse, completeSession } = require('../controllers/mockController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('Student'));

router.post('/sessions', startSession);
router.post('/sessions/:sessionId/responses', submitResponse);
router.put('/sessions/:sessionId/complete', completeSession);

module.exports = router;
