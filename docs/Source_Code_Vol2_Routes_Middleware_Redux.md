# College Placement Preparation Portal
## Full Source Code Documentation — Volume 2
### Backend Routes, Middleware & Utilities

---

## 2.1 The Express Middleware Layer (`backend/middleware/authMiddleware.js`)

**Purpose:** This is the security gateway for every protected API route. It decodes the JWT cookie, validates the user exists in the database, and injects the `user` object into the Express `req` object for downstream controllers to use. It also contains the `authorize()` Role-Based Access Control (RBAC) enforcer.

### Full Source Code
```javascript
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// MIDDLEWARE 1: protect
// Validates the JWT and attaches user to the request object
const protect = async (req, res, next) => {
  let token;

  // Dual-Channel Token Reading: Cookie-first, then Bearer header as fallback
  if (req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    // Cryptographic token verification against the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Database validation: ensure the token's user still exists
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'The user belonging to this token no longer exists.' });
    }

    req.user = user; // Inject user data into the request for downstream controllers
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};

// MIDDLEWARE 2: authorize (Role-Based Access Control)
// Factory function: accepts allowed roles, returns a middleware function
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
```

### How `protect` + `authorize` Work Together
```javascript
// Example usage in a route file:
router.put('/student', protect, authorize('Student'), updateStudentProfile);
// 1. protect  → validates JWT, fetches user, injects req.user
// 2. authorize → checks req.user.role === 'Student', blocks anyone else
// 3. updateStudentProfile → controller only runs if both pass
```

---

## 2.2 All API Route Files (`backend/routes/`)

### 2.2.1 Auth Routes (`authRoutes.js`)
```javascript
const express = require('express');
const { register, login, getMe, logout, googleLogin, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

// Anti brute-force shield: Max 5 recovery attempts per 15 minutes
const recoveryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many recovery attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', protect, getMe);
router.post('/logout', logout);

// Secured with rate limiter to prevent OTP spam attacks
router.post('/forgot-password', recoveryLimiter, forgotPassword);
router.post('/reset-password', recoveryLimiter, resetPassword);

module.exports = router;
```

**Complete Route Map:**

| Method | Path | Auth | Handler |
|--------|------|------|---------|
| POST | `/api/auth/register` | Public | `register` |
| POST | `/api/auth/login` | Public | `login` |
| POST | `/api/auth/google` | Public | `googleLogin` |
| GET | `/api/auth/me` | `protect` | `getMe` |
| POST | `/api/auth/logout` | Public | `logout` |
| POST | `/api/auth/forgot-password` | Rate limited | `forgotPassword` |
| POST | `/api/auth/reset-password` | Rate limited | `resetPassword` |

---

### 2.2.2 Profile Routes (`profileRoutes.js`)
```javascript
const express = require('express');
const { getMyProfile, updateStudentProfile, downloadResume, analyzeResume, analyzeUploadedResume, uploadAvatar } = require('../controllers/profileController');
const { protect, authorize } = require('../middleware/authMiddleware');
const multer = require('multer');

// Multer: In-memory binary file processor (no disk writes)
const upload = multer({
  storage: multer.memoryStorage(), // Files stored in RAM buffer only
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB upload
  fileFilter: (req, file, cb) => {
    // Avatar upload: images only
    if (file.fieldname === 'avatar' && !file.mimetype.startsWith('image/')) {
      return cb(new Error('Please upload only image files.'), false);
    }
    cb(null, true);
  }
});

const router = express.Router();
router.use(protect); // All profile routes require authentication

router.get('/me', getMyProfile);
router.put('/student', authorize('Student'), updateStudentProfile);
router.get('/student/resume', authorize('Student'), downloadResume);
router.post('/student/analyze-resume', authorize('Student'), analyzeResume);
router.post('/student/analyze-upload', authorize('Student'), upload.single('resume'), analyzeUploadedResume);
router.post('/avatar', upload.single('avatar'), uploadAvatar);

module.exports = router;
```

**Complete Route Map:**

| Method | Path | Auth | Handler |
|--------|------|------|---------|
| GET | `/api/profiles/me` | `protect` | `getMyProfile` |
| PUT | `/api/profiles/student` | `protect` + `authorize(Student)` | `updateStudentProfile` |
| GET | `/api/profiles/student/resume` | `protect` + `authorize(Student)` | `downloadResume` |
| POST | `/api/profiles/student/analyze-resume` | `protect` + `authorize(Student)` | `analyzeResume` |
| POST | `/api/profiles/student/analyze-upload` | `protect` + `authorize(Student)` + `multer` | `analyzeUploadedResume` |
| POST | `/api/profiles/avatar` | `protect` | `uploadAvatar` |

---

## 2.3 PDF Resume Generator (`backend/utils/resumeGenerator.js`)

**Library Used:** `pdfkit` — A programmatic PDF creation library for Node.js.
**Purpose:** Takes the student's SQL data, programmatically draws professional PDF layouts using coordinates, and streams the raw bytes directly to the browser response object without saving anything to disk.

### Full Source Code
```javascript
const PDFDocument = require('pdfkit');

const generateResume = (studentProfile, res) => {
  // Initialize an A4 PDF document in memory
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  // Configure HTTP response headers to force browser download
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=resume_${studentProfile.enrollment_no || 'student'}.pdf`);
  
  // Pipe the PDF stream directly into the HTTP response (zero disk I/O)
  doc.pipe(res);

  // SECTION 1: Header (Name, Contact, Links)
  doc.fontSize(22).font('Helvetica-Bold').text(studentProfile.User?.name || 'Student Name', { align: 'center' });
  doc.moveDown(0.2);

  const contactInfo = [
    studentProfile.User?.email,
    studentProfile.phone,
    studentProfile.location
  ].filter(Boolean); // Remove empty values

  doc.fontSize(10).font('Helvetica').text(contactInfo.join(' | '), { align: 'center' });

  const linksInfo = [];
  if (studentProfile.linkedin_link) linksInfo.push(`LinkedIn: ${studentProfile.linkedin_link}`);
  if (studentProfile.github_link) linksInfo.push(`GitHub: ${studentProfile.github_link}`);
  if (linksInfo.length > 0) doc.text(linksInfo.join(' | '), { align: 'center' });
  doc.moveDown(1);

  // SECTION 2: Career Objective
  if (studentProfile.objective) {
    doc.fontSize(14).font('Helvetica-Bold').text('OBJECTIVE');
    doc.moveTo(doc.x, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke(); // Horizontal rule
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text(studentProfile.objective, { align: 'justify' });
    doc.moveDown(1);
  }

  // Helper: Adds a formatted section header with underline
  const addSectionHeader = (title) => {
    doc.fontSize(14).font('Helvetica-Bold').text(title.toUpperCase());
    doc.moveTo(doc.x, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
    doc.moveDown(0.5);
  };

  // SECTION 3: Academic Profile
  addSectionHeader('Academic Profile');
  doc.fontSize(12).font('Helvetica-Bold').text(`${studentProfile.degree || 'Degree'} in ${studentProfile.branch || 'Branch'}`);
  doc.fontSize(10).font('Helvetica').text('Ganga Global Institute of Management Studies');
  doc.moveDown(1);

  // SECTION 4: Technical Skills (Categorized JSON object)
  if (studentProfile.skills) {
    addSectionHeader('Technical Skills');
    const skills = studentProfile.skills;
    if (skills.languages) doc.font('Helvetica-Bold').text('Languages: ', { continued: true }).font('Helvetica').text(skills.languages);
    if (skills.frontend)  doc.font('Helvetica-Bold').text('Frontend: ', { continued: true }).font('Helvetica').text(skills.frontend);
    if (skills.backend)   doc.font('Helvetica-Bold').text('Backend & Databases: ', { continued: true }).font('Helvetica').text(skills.backend);
    if (skills.tools)     doc.font('Helvetica-Bold').text('Tools: ', { continued: true }).font('Helvetica').text(skills.tools);
    doc.moveDown(1);
  }

  // SECTION 5: Projects (JSON Array)
  if (studentProfile.projects && studentProfile.projects.length > 0) {
    addSectionHeader('Professional Projects');
    studentProfile.projects.forEach(proj => {
      doc.fontSize(12).font('Helvetica-Bold').text(proj.title || 'Project Title');
      if (proj.technologies) doc.fontSize(10).font('Helvetica-Oblique').text(`Technologies: ${proj.technologies}`);
      doc.fontSize(10).font('Helvetica').text(proj.description || '').moveDown(0.5);
    });
  }

  // SECTION 6: AI Performance Metrics (from joined SQL tables)
  const mockSessions = studentProfile.MockSessions;
  const testResults = studentProfile.TestResults;

  if ((mockSessions && mockSessions.length > 0) || (testResults && testResults.length > 0)) {
    addSectionHeader('Performance Metrics');
    if (mockSessions && mockSessions.length > 0) {
      doc.font('Helvetica-Bold').text('Mock Interview Score: ', { continued: true }).font('Helvetica').text(`${mockSessions[0].overall_score || 'N/A'}/100`);
    }
    if (testResults && testResults.length > 0) {
      doc.font('Helvetica-Bold').text('Aptitude Score: ', { continued: true }).font('Helvetica').text(`${testResults[0].score || 'N/A'}/100`);
    }
  }

  doc.end(); // Finalize and flush the PDF stream
};

module.exports = { generateResume };
```

---

## 2.4 Redux State Management (`frontend/src/features/auth/authSlice.js`)

**Library:** `@reduxjs/toolkit` with `createAsyncThunk`
**Purpose:** The central state machine for all authentication operations. This file contains all 6 async API Thunks (`login`, `register`, `logout`, `googleLogin`, `forgotPassword`, `resetPassword`) and the Redux slice reducer that manages loading/success/error states.

### Full Source Code
```javascript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth/';
axios.defaults.withCredentials = true; // Enable cross-site cookie sending globally

// Persist session across browser refreshes via localStorage
const user = JSON.parse(localStorage.getItem('user'));

const initialState = {
  user: user ? user : null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// ASYNC THUNK: login
export const login = createAsyncThunk('auth/login', async (userData, thunkAPI) => {
  try {
    const response = await axios.post(API_URL + 'login', userData);
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.user)); // Persist token
      return response.data.user;
    }
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message); // Sends to rejected case
  }
});

// ASYNC THUNK: register
export const register = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
  try {
    const response = await axios.post(API_URL + 'register', userData);
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data.user;
    }
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

// ASYNC THUNK: logout
export const logout = createAsyncThunk('auth/logout', async () => {
  await axios.post(API_URL + 'logout'); // Clears the HttpOnly cookie on server
  localStorage.removeItem('user');      // Clears the persisted session client-side
});

// ASYNC THUNK: googleLogin
export const googleLogin = createAsyncThunk('auth/google', async (token, thunkAPI) => {
  try {
    const response = await axios.post(API_URL + 'google', { token });
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data.user;
    }
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

// ASYNC THUNK: forgotPassword (OTP Request)
export const forgotPassword = createAsyncThunk('auth/forgotPassword', async (identifier, thunkAPI) => {
  try {
    const response = await axios.post(API_URL + 'forgot-password', { identifier });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

// ASYNC THUNK: resetPassword (Final Override)
export const resetPassword = createAsyncThunk('auth/resetPassword', async (resetData, thunkAPI) => {
  try {
    const response = await axios.post(API_URL + 'reset-password', resetData);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

// REDUX SLICE: authSlice
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Synchronous reset: clears temporal flags without touching user session
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // login lifecycle
      .addCase(login.pending, (state) => { state.isLoading = true; })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      // register lifecycle (identical pattern)
      .addCase(register.pending, (state) => { state.isLoading = true; })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      // logout: simply clears user
      .addCase(logout.fulfilled, (state) => { state.user = null; })
      // googleLogin lifecycle (identical to login)
      .addCase(googleLogin.pending, (state) => { state.isLoading = true; })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.isLoading = false; state.isSuccess = true; state.user = action.payload;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.isLoading = false; state.isError = true; state.message = action.payload; state.user = null;
      })
      // forgotPassword lifecycle
      .addCase(forgotPassword.pending, (state) => { state.isLoading = true; })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false; state.isSuccess = true; state.message = action.payload.message;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false; state.isError = true; state.message = action.payload;
      })
      // resetPassword lifecycle
      .addCase(resetPassword.pending, (state) => { state.isLoading = true; })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false; state.isSuccess = true; state.message = action.payload.message;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false; state.isError = true; state.message = action.payload;
      });
  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;
```

### Redux State Shape
At any given moment, `state.auth` contains:
```json
{
  "user": { "id": 1, "name": "Dilkh", "email": "...", "role": "Student" },
  "isLoading": false,
  "isSuccess": false,
  "isError": false,
  "message": ""
}
```
