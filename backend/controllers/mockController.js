const { MockSession, MockResponse, StudentProfile } = require('../models');
const { getMockInterviewResponse } = require('../utils/aiService');

// @desc    Start a new mock session
// @route   POST /api/mock/sessions
// @access  Private (Student)
exports.startSession = async (req, res) => {
  try {
    const { domain } = req.body;
    const student = await StudentProfile.findOne({ where: { userId: req.user.id } });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const session = await MockSession.create({
      studentId: student.id,
      domain
    });

    res.status(201).json({ success: true, data: session });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Submit an answer and get AI feedback
// @route   POST /api/mock/sessions/:sessionId/responses
// @access  Private (Student)
exports.submitResponse = async (req, res) => {
  try {
    const { question, student_answer } = req.body;
    const { sessionId } = req.params;

    const session = await MockSession.findByPk(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Call AI to evaluate answer
    const aiEvaluation = await getMockInterviewResponse(session.domain, question, student_answer);

    const mockResponse = await MockResponse.create({
      sessionId,
      question,
      student_answer,
      ai_feedback: aiEvaluation.ai_feedback,
      correctness_score: aiEvaluation.correctness_score
    });

    res.status(201).json({ success: true, data: mockResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Complete session and generate summary score
// @route   PUT /api/mock/sessions/:sessionId/complete
// @access  Private (Student)
exports.completeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await MockSession.findByPk(sessionId, {
      include: [MockResponse]
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const responses = session.MockResponses || [];
    if (responses.length === 0) {
      return res.status(400).json({ success: false, message: 'No responses found in this session' });
    }

    // Calculate overall score
    const totalScore = responses.reduce((acc, curr) => acc + (curr.correctness_score || 0), 0);
    const overall_score = totalScore / responses.length;

    session.overall_score = overall_score;
    session.feedback_summary = `Session completed with an average score of ${overall_score.toFixed(2)}%`;
    await session.save();

    res.status(200).json({ success: true, data: session });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
