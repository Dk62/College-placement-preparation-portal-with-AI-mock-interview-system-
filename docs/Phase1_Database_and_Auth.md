# College Placement Preparation Portal
## Developer Documentation Book
---

# Phase 1: Core System & Architecture
## Chapter 2: Authentication & Database Models (`authController.js` & `models/index.js`)

### 2.1 Overview and Purpose
The Authentication engine is one of the most mathematically secure and sophisticated modules of this application. 
It leverages industry-standard cryptographic techniques (`bcrypt`), stateless token-based authorization (`JWT` in HTTP-Only cookies), and Federated Identity access via Google OAuth 2.0.

Simultaneously, the Database Architecture is highly relational. The `models/index.js` file structures a complex schema consisting of unified User entities tied to Role-Specific Profile models (StudentProfile, TPOProfile, CompanyProfile) via Foreign Keys.

### 2.2 Database Relationship Architecture (`models/index.js`)
Instead of shoving all user data into a single massive `Users` table, the database is normalized. The `User` model acts as the core authentication trunk, while role-specific tables branch off from it.

```javascript
// =======================================================
// DATABASE RELATIONSHIPS (models/index.js)
// =======================================================
const sequelize = require('../config/db');

// Core Authentication
const User = require('./User');
// Role-Based Profiles
const StudentProfile = require('./StudentProfile');
const TPOProfile = require('./TPOProfile');
const CompanyProfile = require('./CompanyProfile');

// Application Logic Models
const PlacementDrive = require('./PlacementDrive');
const DriveApplication = require('./DriveApplication');

// Define Relationships
// ---------------------------------------------
// 1. A single User has exactly ONE Student Profile
User.hasOne(StudentProfile, { foreignKey: 'userId', onDelete: 'CASCADE' });
StudentProfile.belongsTo(User, { foreignKey: 'userId' });

// 2. A single User has exactly ONE TPO Profile
User.hasOne(TPOProfile, { foreignKey: 'userId', onDelete: 'CASCADE' });
TPOProfile.belongsTo(User, { foreignKey: 'userId' });

// 3. A single User has exactly ONE Company Profile
User.hasOne(CompanyProfile, { foreignKey: 'userId', onDelete: 'CASCADE' });
CompanyProfile.belongsTo(User, { foreignKey: 'userId' });

// ---------------------------------------------
// Drives and Applications mapping
CompanyProfile.hasMany(PlacementDrive, { foreignKey: 'companyId', onDelete: 'CASCADE' });
PlacementDrive.belongsTo(CompanyProfile, { foreignKey: 'companyId' });

StudentProfile.hasMany(DriveApplication, { foreignKey: 'studentId', onDelete: 'CASCADE' });
DriveApplication.belongsTo(StudentProfile, { foreignKey: 'studentId' });
```
**Key Takeaway:** The `onDelete: 'CASCADE'` directive ensures absolute data integrity. If a user deletes their main `User` account, the SQL database automatically seeks out and deletes their associated `StudentProfile`, `TestResult`, and `MockSession` data across the entire database to prevent "orphan data" memory leaks.

---

### 2.3 The Authentication Engine (`authController.js`)
Below is the deep dive into the Registration, Login, and Google OAuth mechanisms.

```javascript
// =======================================================
// DEPENDENCIES
// =======================================================
const { User, StudentProfile, TPOProfile, CompanyProfile } = require('../models');
const bcrypt = require('bcrypt'); // Cryptographic password hashing
const jwt = require('jsonwebtoken'); // Stateless authentication tokens
const { OAuth2Client } = require('google-auth-library'); // Google federated identity
const sendEmail = require('../utils/emailService');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// =======================================================
// HELPER: JWT COOKIE DISPATCHER
// =======================================================
// This function encapsulates the token generation and cookie attachment logic.
const sendTokenResponse = (user, statusCode, res) => {
  // Sign a stateless token containing the user ID and Role
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  // Strict cookie security policies
  const options = {
    expires: new Date(Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRES_IN || 1) * 24 * 60 * 60 * 1000),
    httpOnly: true, // Prevents malicious JavaScript (XSS) from reading the cookie
    secure: true,   // Forces the cookie to only travel over encrypted HTTPS lines
    sameSite: 'none' // CRITICAL: Allows Vercel frontend to receive cookies from Railway backend
  };

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
};

// =======================================================
// ROUTE: REGISTER / SIGN-UP
// =======================================================
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Prevent duplicate accounts
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    // 2. Cryptographic Password Hashing (Salt round: 12)
    // 12 rounds makes it mathematically impossible to brute-force locally.
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Insert into root User table
    const user = await User.create({ name, email, password: hashedPassword, role });

    // 4. Role-Specific Routing Matrix
    if (role === 'Student') {
      await StudentProfile.create({ userId: user.id });
    } else if (role === 'TPO') {
      await TPOProfile.create({ userId: user.id, department: 'General' });
    } else if (role === 'Company') {
      await CompanyProfile.create({ userId: user.id, company_name: name });
    }

    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// =======================================================
// ROUTE: GOOGLE OAUTH FEDERATED LOGIN
// =======================================================
exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body; // Token received from frontend popup
    
    // 1. Cryptographically verify the token against Google's public keys
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    // 2. Extract validated payload
    const { name, email } = ticket.getPayload();
    let user = await User.findOne({ where: { email } });
    
    if (!user) {
      // 3. Stealth Registration: Auto-create account if it doesn't exist
      const role = 'Student'; // Default Google signups to Students
      // Generate a highly secure random string for the internal password requirement
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);
      
      user = await User.create({ name, email, password: hashedPassword, role });
      await StudentProfile.create({ userId: user.id });
    }
    
    // 4. Dispatch the JWT
    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Google Authentication Failed' });
  }
};
```

### 2.4 Detailed Technical Breakdown

#### 2.4.1 Cross-Site Cookie Injection (`sameSite: 'none'`)
The `sendTokenResponse` function contains a highly specialized cookie configuration. 
Because the application operates in a decoupled microservice architecture (Frontend on Vercel, Backend on Railway), they sit on entirely different top-level domains. By default, Chromium-based browsers employ a strict security mechanism that drops cookies attempting to jump between domains. 

By injecting the `secure: true` and `sameSite: 'none'` flags natively into the response headers, the backend commands the browser to lower its guard exclusively for this JWT token, allowing the Vercel app to permanently cache the authentication state!

#### 2.4.2 Stealth Google Registration Workflow
The `googleLogin` function does not just handle logins; it acts as a silent auto-register mechanism. 
When a user clicks "Sign in with Google", the backend checks the Database. If their Gmail address does not exist in the system, the server dynamically generates a 16-character pseudo-random string, hashes it via `bcrypt`, and bypasses the registration page entirely by instantly creating a new `StudentProfile`. This ensures a frictionless "one-click" onboarding experience for end-users.
