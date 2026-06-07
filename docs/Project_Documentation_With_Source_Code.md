# College Placement Preparation Portal with AI Mock Interview

## Complete Project Documentation with Source Code Explanation

Generated from the current project source on 2026-05-18.

This document explains the actual source code in this repository. It is written as a project report and developer guide for the College Placement Preparation Portal with AI Mock Interview system.

## 1. Project Overview

The College Placement Preparation Portal is a full-stack web application for students, placement officers, companies, and administrators. It helps students prepare for campus placements through dashboards, aptitude tests, AI mock interviews, resume building, resume analysis, placement-drive applications, and notifications.

The backend is built with Node.js, Express, Sequelize, and MySQL. The frontend is built with React, Vite, Redux Toolkit, React Router, Tailwind CSS, Axios, Recharts, and Lucide icons.

## 2. Main Features

| Role | Main Features |
| --- | --- |
| Student | Register/login, profile management, resume builder, resume PDF download, AI resume analysis, AI mock interview, aptitude tests, placement-drive applications, notifications |
| TPO | Analytics, company verification, drive launch, student readiness tracking, broadcast messages, CSV report export |
| Company | Company profile, verified drive posting, applicant tracking, application status updates, offer-letter PDF generation |
| Admin | Platform stats, user management, question-bank management, audit logs |

## 3. Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, React Router, Redux Toolkit, Axios, Tailwind CSS, Recharts, Lucide React |
| Backend | Node.js, Express 5, Sequelize ORM, MySQL 8 |
| Authentication | JWT, HTTP-only cookies, bcrypt, Google OAuth |
| AI | Google Gemini via `@google/genai` |
| File and media | Multer memory storage, Cloudinary, PDFKit, pdf-parse |
| Email | Nodemailer with SMTP |
| Security | Helmet, CORS, cookie-parser, express-rate-limit |

## 4. Project Folder Structure

```text
.
|-- backend
|   |-- config
|   |-- controllers
|   |-- middleware
|   |-- models
|   |-- routes
|   |-- seeders
|   |-- utils
|   |-- package.json
|   `-- server.js
|-- frontend
|   |-- public
|   |-- src
|   |   |-- app
|   |   |-- components
|   |   |-- features
|   |   `-- pages
|   |-- package.json
|   `-- vite.config.js
|-- docs
`-- README.md
```

## 5. Backend Architecture

The backend starts from `backend/server.js`. It configures Express middleware, mounts API route groups, ensures the MySQL database exists, connects Sequelize, syncs models, and starts the HTTP server.

### Source Code: Server Bootstrap

```js
// backend/server.js
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const allowedOrigins = ['http://localhost:5173', process.env.FRONTEND_URL];
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    return callback(new Error('CORS blocked cross-origin request'), false);
  },
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
```

### Explanation

This middleware pipeline prepares the API for production-style frontend/backend separation:

- `express.json()` and `express.urlencoded()` parse request bodies.
- `cookieParser()` allows JWT cookies to be read from incoming requests.
- `cors()` allows local Vite frontend requests and deployed Vercel frontend requests.
- `credentials: true` allows cookies to travel between frontend and backend.
- `helmet()` adds basic HTTP security headers.
- `morgan('dev')` logs HTTP requests during development.

### Source Code: Route Mounting

```js
// backend/server.js
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/drives', driveRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/mock', mockRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tpo', tpoRoutes);
app.use('/api/company', companyRoutes);
```

### Explanation

Each route group has a separate file in `backend/routes/`. This keeps the API modular and role-based. For example, student mock interview routes live in `mockRoutes.js`, company ATS routes live in `companyRoutes.js`, and administrator routes live in `adminRoutes.js`.

### Source Code: Database Initialization

```js
// backend/server.js
const connection = await mysql.createConnection({
  host: process.env.MYSQLHOST || process.env.DB_HOST,
  port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
  user: process.env.MYSQLUSER || process.env.DB_USER,
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
});

const targetDbName = process.env.MYSQLDATABASE || process.env.DB_NAME;
await connection.query(`CREATE DATABASE IF NOT EXISTS \`${targetDbName}\`;`);
```

### Explanation

Before Sequelize connects, the server tries to create the target database if it does not exist. This makes local setup easier. The code supports both generic local variable names such as `DB_HOST` and cloud-hosted variable names such as `MYSQLHOST`.

## 6. Database Layer

The database layer uses Sequelize models in `backend/models/`. Associations are collected in `backend/models/index.js`.

### Main Models

| Model | Purpose |
| --- | --- |
| `User` | Stores login identity, role, password hash, contact data, reset OTP, avatar links |
| `StudentProfile` | Stores student academic profile, resume data, skills, projects, education |
| `TPOProfile` | Stores placement officer profile data |
| `CompanyProfile` | Stores company details and verification state |
| `PlacementDrive` | Stores job drive details, eligibility, package, date, status |
| `DriveApplication` | Connects students to placement drives and tracks application status |
| `QuestionBank` | Stores aptitude/technical MCQs |
| `AptitudeTest` | Stores test metadata |
| `TestQuestion` | Junction table between tests and questions |
| `TestResult` | Stores student test scores |
| `MockSession` | Stores a student's AI mock interview session |
| `MockResponse` | Stores answers, AI feedback, and correctness score |
| `Notification` | Stores in-app notification messages |
| `AuditLog` | Stores admin actions |

### Source Code: User Model

```js
// backend/models/User.js
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('Student', 'TPO', 'Company', 'Admin'), allowNull: false },
  is_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  google_id: { type: DataTypes.STRING, allowNull: true },
  profile_pic: { type: DataTypes.STRING, allowNull: true },
  profile_pic_public_id: { type: DataTypes.STRING, allowNull: true },
  phone: { type: DataTypes.STRING, allowNull: true, unique: true },
  reset_password_otp: { type: DataTypes.STRING, allowNull: true },
  reset_password_expires: { type: DataTypes.DATE, allowNull: true }
});
```

### Explanation

`User` is the central authentication table. Every user has a role. Role-specific data is stored in separate profile tables so student, TPO, and company data can evolve independently.

### Source Code: Model Associations

```js
// backend/models/index.js
User.hasOne(StudentProfile, { foreignKey: 'userId', onDelete: 'CASCADE' });
StudentProfile.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(TPOProfile, { foreignKey: 'userId', onDelete: 'CASCADE' });
TPOProfile.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(CompanyProfile, { foreignKey: 'userId', onDelete: 'CASCADE' });
CompanyProfile.belongsTo(User, { foreignKey: 'userId' });

CompanyProfile.hasMany(PlacementDrive, { foreignKey: 'companyId', onDelete: 'CASCADE' });
PlacementDrive.belongsTo(CompanyProfile, { foreignKey: 'companyId' });

StudentProfile.hasMany(DriveApplication, { foreignKey: 'studentId', onDelete: 'CASCADE' });
DriveApplication.belongsTo(StudentProfile, { foreignKey: 'studentId' });

PlacementDrive.hasMany(DriveApplication, { foreignKey: 'driveId', onDelete: 'CASCADE' });
DriveApplication.belongsTo(PlacementDrive, { foreignKey: 'driveId' });
```

### Explanation

These associations create the relational structure of the portal:

- One `User` can have one role-specific profile.
- One `CompanyProfile` can post many `PlacementDrive` records.
- One `StudentProfile` can submit many `DriveApplication` records.
- One `PlacementDrive` can receive many applications.
- Cascade delete keeps related data clean when a parent entity is deleted.

## 7. Authentication and Authorization

Authentication is handled in `backend/controllers/authController.js` and protected by middleware in `backend/middleware/authMiddleware.js`.

### Source Code: JWT Cookie Creation

```js
// backend/controllers/authController.js
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  const options = {
    expires: new Date(Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRES_IN || 1) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  };

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};
```

### Explanation

When login or registration succeeds, the backend creates a JWT containing the user ID and role. It sends the token as an HTTP-only cookie and also returns basic user data to the frontend. The cookie uses `secure: true` and `sameSite: 'none'`, which is important when the frontend and backend are deployed on separate domains.

### Source Code: Protected Middleware

```js
// backend/middleware/authMiddleware.js
const protect = async (req, res, next) => {
  let token;

  if (req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findByPk(decoded.id);
  req.user = user;
  next();
};
```

### Explanation

The middleware accepts authentication from either a cookie or a Bearer token. After verification, it loads the user and attaches it to `req.user`, which controllers use to find the current user's profile and role.

### Source Code: Role Authorization

```js
// backend/middleware/authMiddleware.js
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
```

### Explanation

`authorize()` restricts API routes to specific roles. Example: mock interview routes are only available to students, admin routes are only available to admins, and company ATS routes are only available to company users.

## 8. API Endpoint Reference

### Auth Routes: `/api/auth`

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/register` | Public | Create user and role profile |
| POST | `/login` | Public | Validate credentials and issue JWT |
| POST | `/google` | Public | Login/register with Google OAuth |
| GET | `/me` | Authenticated | Return current user |
| POST | `/logout` | Public | Expire auth cookie |
| POST | `/forgot-password` | Public, rate-limited | Send recovery OTP |
| POST | `/reset-password` | Public, rate-limited | Reset password with OTP |

### Profile Routes: `/api/profiles`

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/me` | Authenticated | Return current role-specific profile |
| PUT | `/student` | Student | Update student profile |
| GET | `/student/resume` | Student | Generate resume PDF |
| POST | `/student/analyze-resume` | Student | Analyze saved profile data with AI |
| POST | `/student/analyze-upload` | Student | Analyze uploaded PDF resume |
| POST | `/avatar` | Authenticated | Upload avatar to Cloudinary |

### Drive Routes: `/api/drives`

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/` | Authenticated | List placement drives |
| POST | `/` | TPO, Company, Admin | Create placement drive |
| POST | `/:id/apply` | Student | Apply to a drive |
| PUT | `/applications/:id` | TPO, Company, Admin | Update application status |

### Test Routes: `/api/tests`

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/` | Authenticated | List tests |
| POST | `/` | TPO, Admin | Create test |
| POST | `/generate` | Student | Generate AI aptitude test |
| GET | `/:id` | Authenticated | Get test with questions |
| POST | `/:id/submit` | Student | Submit score |

### Mock Interview Routes: `/api/mock`

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/sessions` | Student | Start mock interview session |
| POST | `/sessions/:sessionId/responses` | Student | Submit answer and receive AI feedback |
| PUT | `/sessions/:sessionId/complete` | Student | Complete session and calculate average score |

### Admin Routes: `/api/admin`

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/stats` | Admin | Platform dashboard statistics |
| GET | `/logs` | Admin | Audit log list |
| GET | `/users` | Admin | Search/filter users |
| DELETE | `/users/:id` | Admin | Delete user |
| GET | `/questions` | Admin | List question bank |
| POST | `/questions` | Admin | Add question |
| DELETE | `/questions/:id` | Admin | Delete question |

### TPO Routes: `/api/tpo`

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/analytics` | TPO, Admin | Placement analytics |
| GET | `/companies` | TPO, Admin | Company verification list |
| PUT | `/companies/:id/approve` | TPO, Admin | Approve company |
| POST | `/drives` | TPO, Admin | Launch drive |
| GET | `/students/readiness` | TPO, Admin | Student readiness tracker |
| POST | `/broadcast` | TPO, Admin | Send notifications/emails |
| GET | `/export` | TPO, Admin | Export CSV report |

### Company Routes: `/api/company`

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/profile` | Company | Get company profile |
| PUT | `/profile` | Company | Update company profile |
| GET | `/drives` | Company | List own drives |
| POST | `/drives` | Company | Post drive after TPO verification |
| GET | `/drives/:driveId/applications` | Company | List applications for a drive |
| PUT | `/applications/:id/status` | Company | Update application pipeline status |
| GET | `/applications/:id/offer` | Company | Generate offer letter PDF |

### Notification and User Routes

| Base | Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- | --- |
| `/api/notifications` | GET | `/` | Authenticated | Get current user's notifications |
| `/api/notifications` | PUT | `/mark-read` | Authenticated | Mark notifications as read |
| `/api/users` | PUT | `/update-settings` | Authenticated | Update email/contact profile data |
| `/api/users` | PUT | `/change-password` | Authenticated | Change password |

## 9. AI Integration

The project uses Gemini through `@google/genai` in `backend/utils/aiService.js`.

### Source Code: Mock Interview Feedback

```js
// backend/utils/aiService.js
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

  const response = await ai.models.generateContent({
    model: 'gemini-flash-latest',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
    }
  });

  return JSON.parse(response.text);
};
```

### Explanation

The AI prompt asks Gemini to behave like a technical interviewer and return JSON. `responseMimeType: 'application/json'` makes the response easier to parse safely in the controller.

### Source Code: AI Test Generation

```js
// backend/controllers/testController.js
const questions = await generateAptitudeQuestions(domain, count || 5);

const test = await AptitudeTest.create({
  title: `AI Test: ${domain}`,
  duration_minutes: (count || 5) * 2,
  total_marks: (count || 5) * 10
});

for (const q of questions) {
  const dbQuestion = await QuestionBank.create({
    domain: domain,
    topic: 'AI Generated',
    difficulty: 'Medium',
    question_text: q.question,
    options: q.options,
    correct_option: q.correct
  });
  await test.addQuestionBank(dbQuestion);
}
```

### Explanation

When a student generates a test, Gemini creates MCQs. The backend stores them in `QuestionBank`, creates an `AptitudeTest`, links the questions to the test, and returns the generated questions to the frontend.

## 10. Resume and ATS System

The resume system has three main parts:

- Profile data entry in the frontend.
- PDF resume generation using `PDFKit`.
- ATS analysis using Gemini and either saved profile data or uploaded PDF text.

### Source Code: Uploaded PDF Resume Analysis

```js
// backend/controllers/profileController.js
if (req.file.mimetype !== 'application/pdf') {
  return res.status(400).json({
    success: false,
    message: 'Invalid file type. Only PDF format is allowed.'
  });
}

const pdfData = await pdfParse(req.file.buffer);
const extractedText = pdfData.text;

const analysisResult = await getResumeAnalysis(extractedText);
res.status(200).json({ success: true, data: analysisResult });
```

### Explanation

The route accepts a PDF in memory using Multer. `pdf-parse` extracts readable text. The extracted text is sent to Gemini for ATS score, strengths, weaknesses, and improvement suggestions.

## 11. Placement Drive Workflow

### Student Flow

1. Student logs in.
2. Student views available drives from `/api/drives`.
3. Student applies with `POST /api/drives/:id/apply`.
4. Backend checks CGPA eligibility.
5. `DriveApplication` is created with status `Applied`.

### Company Flow

1. Company registers and creates a company profile.
2. TPO verifies the company.
3. Company posts placement drives.
4. Company reviews applications in ATS.
5. Company changes statuses to `Shortlisted`, `Selected`, or `Rejected`.
6. If selected, company can generate an offer letter PDF.

### Source Code: Student Eligibility Check

```js
// backend/controllers/driveController.js
const student = await StudentProfile.findOne({ where: { userId: req.user.id } });
const drive = await PlacementDrive.findByPk(req.params.id);

if (student.cgpa < drive.eligibility_cgpa) {
  return res.status(400).json({
    success: false,
    message: 'Not eligible based on CGPA'
  });
}

const application = await DriveApplication.create({
  studentId: student.id,
  driveId: drive.id,
  status: 'Applied'
});
```

### Explanation

The backend prevents ineligible applications based on CGPA before creating the application row.

### Source Code: Company ATS Status Update

```js
// backend/controllers/companyController.js
const t = await sequelize.transaction();

const app = await DriveApplication.findByPk(id, {
  include: [
    { model: PlacementDrive, include: [CompanyProfile] },
    { model: StudentProfile, include: [User] }
  ],
  transaction: t
});

app.status = status;
await app.save({ transaction: t });

await Notification.create({
  userId: app.StudentProfile.User.id,
  title: `Application Status Change: ${app.PlacementDrive.CompanyProfile.company_name}`,
  message: `Your candidature for the ${app.PlacementDrive.job_role} role has transitioned to: ${status}.`,
  type: 'Alert'
}, { transaction: t });

await t.commit();
```

### Explanation

The company ATS update uses a Sequelize transaction. The status update and notification creation are committed together. If anything fails, the transaction rolls back.

## 12. Frontend Architecture

The frontend starts from `frontend/src/main.jsx`, configures Axios, wraps the app in Redux and Google OAuth providers, and renders `App.jsx`.

### Source Code: Axios Deployment Interceptor

```jsx
// frontend/src/main.jsx
axios.defaults.withCredentials = true;
axios.interceptors.request.use((config) => {
  let cloudApi = import.meta.env.VITE_API_URL;
  if (cloudApi && config.url && config.url.includes('http://localhost:5000')) {
    cloudApi = cloudApi.replace(/\/$/, '');
    if (!cloudApi.startsWith('http')) {
      cloudApi = `https://${cloudApi}`;
    }
    config.url = config.url.replace('http://localhost:5000', cloudApi);
  }
  return config;
});
```

### Explanation

Most frontend pages call `http://localhost:5000`. The interceptor rewrites those URLs to `VITE_API_URL` in production. This lets the same source code work locally and after deployment.

### Source Code: Application Routes

```jsx
// frontend/src/App.jsx
<Route path="/" element={<Layout />}>
  <Route index element={<Home />} />
  <Route path="login" element={<Login />} />
  <Route path="register" element={<Register />} />
  <Route path="forgot-password" element={<ForgotPassword />} />
  <Route path="dashboard" element={<Dashboard />} />
  <Route path="profile" element={<Profile />} />
  <Route path="aptitude-test" element={<AptitudeTest />} />
  <Route path="mock-interview" element={<MockInterview />} />
  <Route path="drives" element={<PlacementDrives />} />
  <Route path="resume-builder" element={<ResumeBuilder />} />
  <Route path="resume-analyzer" element={<ResumeAnalyzer />} />
</Route>
```

### Explanation

The public/global layout includes the navbar, footer, and general pages. Role-specific panels use separate protected route trees for Admin, TPO, and Company.

### Source Code: Protected Role Routes

```jsx
// frontend/src/App.jsx
<Route
  path="/admin"
  element={
    <ProtectedRoute allowedRoles={['Admin']}>
      <RoleLayout />
    </ProtectedRoute>
  }
>
  <Route index element={<AdminDashboard />} />
  <Route path="users" element={<UserManagement />} />
  <Route path="questions" element={<QuestionManager />} />
  <Route path="logs" element={<SystemLogs />} />
</Route>
```

### Explanation

The frontend checks the logged-in user's role before allowing access to role panels. The backend also enforces the same role rules, so API security does not depend only on the UI.

### Source Code: ProtectedRoute Component

```jsx
// frontend/src/components/ProtectedRoute.jsx
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};
```

### Explanation

If no user exists in Redux state, the user is redirected to login. If the user is logged in but does not match the required role, the app redirects to home.

## 13. Redux State Management

Redux Toolkit is used for authentication and notifications.

### Source Code: Store

```js
// frontend/src/app/store.js
export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationReducer,
  },
});
```

### Source Code: Login Thunk

```js
// frontend/src/features/auth/authSlice.js
export const login = createAsyncThunk('auth/login', async (userData, thunkAPI) => {
  try {
    const response = await axios.post(API_URL + 'login', userData);
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data.user;
    }
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});
```

### Explanation

The login thunk sends credentials to the backend. On success, it stores safe user data in local storage and updates Redux state. The actual JWT remains in the HTTP-only cookie.

## 14. Role-Based Frontend Panels

`frontend/src/components/RoleLayout.jsx` creates separate navigation menus for Admin, TPO, and Company.

### Source Code: Role Navigation Configuration

```jsx
// frontend/src/components/RoleLayout.jsx
const roleConfigs = {
  Admin: {
    title: "Admin Matrix",
    basePath: "/admin",
    nav: [
      { label: 'Platform Overview', path: '/admin', icon: LayoutDashboard },
      { label: 'User Vault', path: '/admin/users', icon: Users },
      { label: 'Content Forge', path: '/admin/questions', icon: BookOpen },
      { label: 'Audit Trail', path: '/admin/logs', icon: FileText },
    ]
  },
  TPO: {
    title: "Officer Station",
    basePath: "/tpo-panel",
    nav: [
      { label: 'Analytics Engine', path: '/tpo-panel', icon: LineChart },
      { label: 'Company Clearances', path: '/tpo-panel/companies', icon: CheckCircle2 },
      { label: 'Dispatch Drives', path: '/tpo-panel/drives', icon: Briefcase },
      { label: 'Batch Radar', path: '/tpo-panel/students', icon: Users },
      { label: 'Mass Relay', path: '/tpo-panel/broadcast', icon: Megaphone },
    ]
  }
};
```

### Explanation

Instead of writing separate layout components for each role, the app uses one `RoleLayout` component and changes the menu based on the current user's role.

## 15. Important Frontend Page-to-API Mapping

| Page | API Used | Purpose |
| --- | --- | --- |
| `Login.jsx` | `/api/auth/login`, `/api/auth/google` | Login and Google authentication |
| `Register.jsx` | `/api/auth/register` | New user registration |
| `ForgotPassword.jsx` | `/api/auth/forgot-password`, `/api/auth/reset-password` | OTP password recovery |
| `Profile.jsx` | `/api/profiles/me`, `/api/profiles/student/resume` | View profile and download resume |
| `ResumeBuilder.jsx` | `/api/profiles/me`, `/api/profiles/student` | Edit profile/resume data |
| `ResumeAnalyzer.jsx` | `/api/profiles/student/analyze-upload` | Upload PDF and get ATS analysis |
| `MockInterview.jsx` | `/api/mock/sessions`, `/api/mock/sessions/:id/responses` | AI interview session and answer feedback |
| `AptitudeTest.jsx` | `/api/tests/generate`, `/api/tests/:id/submit` | Generate and submit test |
| `PlacementDrives.jsx` | `/api/drives`, `/api/drives/:id/apply` | View and apply to drives |
| `AdminDashboard.jsx` | `/api/admin/stats` | Admin metrics |
| `QuestionManager.jsx` | `/api/admin/questions` | Question-bank CRUD |
| `TPOAnalytics.jsx` | `/api/tpo/analytics`, `/api/tpo/export` | TPO stats and export |
| `CompanyApproval.jsx` | `/api/tpo/companies` | Verify companies |
| `DriveManager.jsx` | `/api/company/drives` | Company drive posting |
| `RecruitmentATS.jsx` | `/api/company/drives/:id/applications`, `/api/company/applications/:id/status` | ATS pipeline |

## 16. Environment Variables

### Backend `.env`

```env
PORT=5000
FRONTEND_URL=http://localhost:5173

MYSQLHOST=localhost
MYSQLPORT=3306
MYSQLUSER=root
MYSQLPASSWORD=your_mysql_password
MYSQLDATABASE=placement_portal

JWT_SECRET=replace_with_long_secret
JWT_EXPIRES_IN=1d
JWT_COOKIE_EXPIRES_IN=1

GOOGLE_CLIENT_ID=your_google_client_id
GEMINI_API_KEY=your_gemini_api_key

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_google_app_password

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000
```

For production, `VITE_API_URL` should point to the deployed backend URL.

## 17. Installation and Running

### Backend

```bash
cd backend
npm install
npm run dev
```

The backend starts on `http://localhost:5000` by default.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite frontend starts on `http://localhost:5173` by default.

### Production Build

```bash
cd frontend
npm run build
```

## 18. Core User Workflows

### Registration and Login

1. User registers as Student, TPO, Company, or Admin.
2. Backend hashes the password using bcrypt.
3. Backend creates a role-specific profile when required.
4. Backend signs a JWT and sends it in a secure cookie.
5. Frontend stores non-sensitive user data in local storage and Redux.

### Student Preparation

1. Student completes profile and resume data.
2. Student downloads generated resume PDF.
3. Student uploads a PDF resume for ATS analysis.
4. Student starts mock interview sessions.
5. Student generates aptitude tests.
6. Student applies to placement drives.

### TPO Management

1. TPO views placement analytics.
2. TPO verifies companies.
3. TPO launches drives.
4. TPO monitors student readiness.
5. TPO broadcasts messages to students.
6. TPO exports student reports as CSV.

### Company Recruitment

1. Company completes profile.
2. Company waits for TPO verification.
3. Verified company posts drives.
4. Company views applicants.
5. Company updates application status.
6. Company generates offer letters for selected candidates.

### Admin Control

1. Admin views platform statistics.
2. Admin searches and removes users.
3. Admin manages question bank.
4. Admin reviews audit logs.

## 19. Security Notes

- Passwords are hashed with bcrypt before saving.
- JWT is sent through an HTTP-only cookie.
- Backend routes use `protect` and `authorize` middleware.
- Admin/TPO/Company panels are guarded in the frontend.
- Sensitive deployment values are read from environment variables.
- Password recovery endpoints use `express-rate-limit`.
- Cloudinary uploads use server-side credentials, not frontend credentials.

## 20. Known Technical Notes

- `frontend/src/main.jsx` rewrites local API URLs to `VITE_API_URL`, so existing hardcoded `http://localhost:5000` calls still work after deployment.
- Backend database creation supports both `MYSQL*` environment variables and fallback `DB_*` names in `server.js`; `backend/config/db.js` currently uses the `MYSQL*` names directly.
- Some global student pages are not wrapped by frontend `ProtectedRoute`, but their backend APIs are protected. If stronger UI gating is required, wrap student pages in `ProtectedRoute allowedRoles={['Student']}`.
- The existing `docs/Source_Code_Vol*.md` files contain deeper full-source documentation by topic. This file is the consolidated project-level guide.

## 21. Source Code File Index

### Backend Files

| File | Responsibility |
| --- | --- |
| `backend/server.js` | Express app, middleware, route mounting, database initialization |
| `backend/config/db.js` | Sequelize MySQL connection |
| `backend/config/cloudinary.js` | Cloudinary client setup |
| `backend/middleware/authMiddleware.js` | JWT authentication and role authorization |
| `backend/controllers/authController.js` | Register, login, Google auth, logout, password recovery |
| `backend/controllers/profileController.js` | Profile data, resume generation, ATS analysis, avatar upload |
| `backend/controllers/driveController.js` | General drive listing, drive creation, student applications |
| `backend/controllers/testController.js` | Tests, AI-generated tests, test submissions |
| `backend/controllers/mockController.js` | Mock interview sessions and AI feedback |
| `backend/controllers/adminController.js` | Admin stats, users, questions, audit logs |
| `backend/controllers/tpoController.js` | TPO analytics, company approval, broadcasts, CSV export |
| `backend/controllers/companyController.js` | Company profile, drives, ATS, offer letters |
| `backend/controllers/notificationController.js` | Notification listing and read status |
| `backend/controllers/userController.js` | Settings and password changes |
| `backend/utils/aiService.js` | Gemini prompt calls for interviews, resumes, tests |
| `backend/utils/emailService.js` | SMTP email sending |
| `backend/utils/cloudinaryService.js` | Cloudinary upload/delete helpers |
| `backend/utils/resumeGenerator.js` | PDF resume generation |

### Frontend Files

| File | Responsibility |
| --- | --- |
| `frontend/src/main.jsx` | React root, Redux provider, Google OAuth provider, Axios interceptor |
| `frontend/src/App.jsx` | Route definitions |
| `frontend/src/app/store.js` | Redux store |
| `frontend/src/features/auth/authSlice.js` | Authentication async thunks and state |
| `frontend/src/features/notifications/notificationSlice.js` | Notification async thunks and state |
| `frontend/src/components/Layout.jsx` | Global layout |
| `frontend/src/components/Navbar.jsx` | Main navigation, profile menu, notifications |
| `frontend/src/components/ProtectedRoute.jsx` | Frontend route guard |
| `frontend/src/components/RoleLayout.jsx` | Admin/TPO/Company dashboard shell |
| `frontend/src/pages/MockInterview.jsx` | Student mock interview UI |
| `frontend/src/pages/AptitudeTest.jsx` | Student aptitude test UI |
| `frontend/src/pages/ResumeBuilder.jsx` | Resume/profile editing UI |
| `frontend/src/pages/ResumeAnalyzer.jsx` | PDF upload and ATS analysis UI |
| `frontend/src/pages/PlacementDrives.jsx` | Placement drive listing and apply UI |
| `frontend/src/pages/admin/*` | Admin dashboard pages |
| `frontend/src/pages/tpo/*` | TPO dashboard pages |
| `frontend/src/pages/company/*` | Company dashboard pages |

## 22. Conclusion

This project implements a complete placement-preparation platform with role-based access, relational database modeling, AI-powered preparation tools, resume automation, placement-drive management, notifications, and administrative monitoring. The source code is organized into a maintainable full-stack architecture: Express route/controller/model layers on the backend and React route/page/state layers on the frontend.

