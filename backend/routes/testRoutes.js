const express = require('express');
const { getTests, getTestById, submitTest, createTest, generateAIGeneratedTest } = require('../controllers/testController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getTests)
  .post(authorize('TPO', 'Admin'), createTest);

router.post('/generate', authorize('Student'), generateAIGeneratedTest);

router.route('/:id')
  .get(getTestById);

router.post('/:id/submit', authorize('Student'), submitTest);

module.exports = router;
