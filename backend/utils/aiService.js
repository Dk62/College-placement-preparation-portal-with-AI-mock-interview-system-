const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const getMockInterviewResponse = async (domain, question, studentAnswer) => {
  const prompt = `
    You are an expert technical interviewer for the domain: ${domain}.
    The question asked to the candidate was: "${question}".
    The candidate's response was: "${studentAnswer}".
    
    Evaluate the candidate's response based on correctness, clarity, and keyword match.
    Provide your response strictly in the following JSON format without any markdown backticks:
    {
      "ai_feedback": "Your detailed feedback here",
      "correctness_score": <a number between 0 and 100>
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const result = JSON.parse(response.text);
    return result;
  } catch (error) {
    console.error('Error with Gemini API:', error);
    // Fallback response in case of error
    return {
      ai_feedback: "Error evaluating response. Please try again.",
      correctness_score: 0
    };
  }
};

const getResumeAnalysis = async (resumeDataString) => {
  const prompt = `
    You are an expert ATS (Applicant Tracking System) and Senior Technical Recruiter.
    I am providing you with a student's resume data (this might be structured JSON or raw extracted text from a PDF file):
    
    ${resumeDataString}
    
    Analyze the resume for strengths, weaknesses, and ATS optimization.
    Provide your response strictly in the following JSON format without any markdown backticks:
    {
      "ats_score": <a number between 0 and 100>,
      "strengths": ["Strength 1", "Strength 2"],
      "weaknesses": ["Weakness 1", "Weakness 2"],
      "suggested_improvements": ["Improvement 1", "Improvement 2"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const result = JSON.parse(response.text);
    return result;
  } catch (error) {
    const logMessage = `[${new Date().toISOString()}] Gemini Analysis Failed.\nError: ${error.message}\nStack: ${error.stack}\n\n`;
    fs.appendFileSync(path.join(__dirname, '..', 'debug_resume.log'), logMessage);

    console.error('Error with Gemini API during resume analysis:', error);
    return {
      ats_score: 0,
      strengths: [],
      weaknesses: ["Error analyzing resume. Please try again later."],
      suggested_improvements: []
    };
  }
};

const generateAptitudeQuestions = async (domain, count = 5) => {
  const prompt = `
    You are an expert examiner for placement aptitude tests.
    Generate exactly ${count} multiple-choice questions for the domain: "${domain}".
    The questions should be appropriate for final-year college students preparing for campus placements.
    
    Provide your response strictly in the following JSON array format without any markdown backticks or explanations:
    [
      {
        "question": "What is ...?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correct": "Option A"
      }
    ]
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const result = JSON.parse(response.text);
    return result;
  } catch (error) {
    const logMessage = `[${new Date().toISOString()}] generateAptitudeQuestions (Gemini Call) failed.\nError: ${error.message}\nStack: ${error.stack}\n\n`;
    fs.appendFileSync(path.join(__dirname, '..', 'debug_test.log'), logMessage);
    
    console.error('Error with Gemini API during test generation:', error);
    // Fallback response in case of error
    return [
      {
        question: "An error occurred while generating the test. Please try again later.",
        options: ["OK", "Retry", "Cancel", "Abort"],
        correct: "OK"
      }
    ];
  }
};

module.exports = { getMockInterviewResponse, getResumeAnalysis, generateAptitudeQuestions };
