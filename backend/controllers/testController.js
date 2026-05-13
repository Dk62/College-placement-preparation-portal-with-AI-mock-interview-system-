const { AptitudeTest, QuestionBank, TestQuestion, TestResult, StudentProfile } = require('../models');
const { generateAptitudeQuestions } = require('../utils/aiService');
const fs = require('fs');
const path = require('path');

// @desc    Get all tests
// @route   GET /api/tests
// @access  Private
exports.getTests = async (req, res) => {
  try {
    const tests = await AptitudeTest.findAll();
    res.status(200).json({ success: true, data: tests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get test by ID with questions
// @route   GET /api/tests/:id
// @access  Private
exports.getTestById = async (req, res) => {
  try {
    const test = await AptitudeTest.findByPk(req.params.id, {
      include: [{ model: QuestionBank, through: { attributes: [] } }] // exclude junction table attributes
    });

    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    res.status(200).json({ success: true, data: test });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Submit a test result
// @route   POST /api/tests/:id/submit
// @access  Private (Student only)
exports.submitTest = async (req, res) => {
  try {
    const { score, accuracy_percentage } = req.body;
    const testId = req.params.id;

    const student = await StudentProfile.findOne({ where: { userId: req.user.id } });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const result = await TestResult.create({
      studentId: student.id,
      testId,
      score,
      accuracy_percentage
    });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create a new test (Admin/TPO)
// @route   POST /api/tests
// @access  Private (Admin, TPO)
exports.createTest = async (req, res) => {
  try {
    const { title, duration_minutes, total_marks, questionIds } = req.body;

    const test = await AptitudeTest.create({ title, duration_minutes, total_marks });

    // Link questions to this test
    if (questionIds && questionIds.length > 0) {
      await test.addQuestionBanks(questionIds);
    }

    res.status(201).json({ success: true, data: test });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Generate AI Test
// @route   POST /api/tests/generate
// @access  Private (Student)
exports.generateAIGeneratedTest = async (req, res) => {
  try {
    const { domain, count } = req.body;
    
    // Call AI to generate questions
    const questions = await generateAptitudeQuestions(domain, count || 5);
    
    // Create a temporary AptitudeTest record
    const test = await AptitudeTest.create({
      title: `AI Test: ${domain}`,
      duration_minutes: (count || 5) * 2, // 2 mins per question
      total_marks: (count || 5) * 10
    });
    
    // Create QuestionBank records for these dynamic questions and link them
    for (const q of questions) {
      const dbQuestion = await QuestionBank.create({
        domain: domain,
        topic: 'AI Generated',
        difficulty: 'Medium',
        question_text: q.question,
        options: q.options, // model takes JSON directly
        correct_option: q.correct // store the plain text correct string
      });
      await test.addQuestionBank(dbQuestion);
    }
    
    // Return the generated questions mapped to the frontend expected format
    res.status(201).json({ success: true, testId: test.id, data: questions });
  } catch (error) {
    const logMessage = `[${new Date().toISOString()}] Test generation failed.\nError: ${error.message}\nStack: ${error.stack}\n\n`;
    fs.appendFileSync(path.join(__dirname, '..', 'debug_test.log'), logMessage);
    
    console.error('Error generating AI test:', error);
    res.status(500).json({ success: false, message: error.message || 'Server Error during test generation' });
  }
};
