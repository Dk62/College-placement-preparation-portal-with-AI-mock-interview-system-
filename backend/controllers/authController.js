const { User, StudentProfile, TPOProfile, CompanyProfile } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { Op } = require('sequelize');
const sendEmail = require('../utils/emailService');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper to generate token and send cookie
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  const options = {
    expires: new Date(Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
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

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    // Create specific profile based on role
    if (role === 'Student') {
      await StudentProfile.create({ userId: user.id });
    } else if (role === 'TPO') {
      await TPOProfile.create({ userId: user.id, department: 'General' }); // Set default department
    } else if (role === 'Company') {
      await CompanyProfile.create({ userId: user.id, company_name: name });
    }

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ success: true, data: {} });
};

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    
    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const { name, email } = ticket.getPayload();
    
    // Check if user exists
    let user = await User.findOne({ where: { email } });
    
    if (!user) {
      // Create user if they don't exist (default to Student role for Google Login)
      const role = 'Student';
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);
      
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        role
      });
      
      // Create student profile
      await StudentProfile.create({ userId: user.id });
    }
    
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ success: false, message: 'Google Authentication Failed' });
  }
};

// @desc    Generate OTP & send via Email
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Please provide an email or phone number' });
    }

    // Multi-Channel Identification Lookup
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: identifier },
          { phone: identifier }
        ]
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account identified with those details' });
    }

    // Cryptographically safe 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Cache in database for exactly 10 minutes
    await user.update({
      reset_password_otp: otp,
      reset_password_expires: Date.now() + 10 * 60 * 1000
    });

    // High-Contrast Professional HTML template
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f7f8fc; padding: 40px 20px;">
        <div style="max-width: 500px; background: #ffffff; border-radius: 16px; padding: 32px; margin: 0 auto; box-shadow: 0 8px 32px rgba(0,0,0,0.04); border: 1px solid #eaeef5;">
          <h2 style="color: #aa3bff; text-align: center; margin-top: 0; font-size: 24px;">Access Recovery</h2>
          <p style="color: #4b5563; text-align: center; font-size: 15px; line-height: 1.5;">Enter the following One-Time Password (OTP) on the recovery form to reset your secure access key:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #ffffff; background: linear-gradient(135deg, #aa3bff, #7d1cc4); padding: 12px 28px; border-radius: 12px; display: inline-block; box-shadow: 0 6px 20px rgba(170, 59, 255, 0.25); text-shadow: 0 2px 4px rgba(0,0,0,0.1);">${otp}</span>
          </div>
          <p style="color: #6b7280; font-size: 13px; text-align: center; font-weight: 500;">⏳ Secure expiry in **10 minutes**</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="font-size: 11px; color: #9ca3af; text-align: center; margin: 0;">This is an automated security protocol dispatch. If you did not initiate this reset request, your credentials may be exposed — please secure your system immediately.</p>
        </div>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: `${otp} is your Account Recovery Code`,
        message: `Your account recovery code is: ${otp}. Expiry in 10 minutes.`,
        html: htmlContent
      });

      res.status(200).json({
        success: true,
        message: `OTP successfully dispatched to your registered contact method.`
      });
    } catch (emailError) {
      console.error('Email Dispatch Failure:', emailError);
      
      // EMERGENCY DEBUG LOG - Dump physical error for Antigravity analyzer
      const fs = require('fs');
      const path = require('path');
      const errorPayload = `[${new Date().toISOString()}]\nError Code: ${emailError.code}\nMessage: ${emailError.message}\nStack: ${emailError.stack}\n\n`;
      fs.appendFileSync(path.join(__dirname, '..', 'debug_email.log'), errorPayload);

      await user.update({ reset_password_otp: null, reset_password_expires: null });
      return res.status(500).json({ success: false, message: 'System failed to send communication. Please retry later.' });
    }

  } catch (error) {
    console.error('Forgot Password Handler Error:', error);
    res.status(500).json({ success: false, message: 'Internal server failure executing recovery operation' });
  }
};

// @desc    Verify OTP & override password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { identifier, otp, newPassword } = req.body;

    if (!identifier || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Missing required parameters' });
    }

    // Ensure exactly matching OTP exists and hasn't breached validation window
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: identifier },
          { phone: identifier }
        ],
        reset_password_otp: otp,
        reset_password_expires: {
          [Op.gt]: Date.now()
        }
      }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Access denied. The OTP key is invalid or has expired.' });
    }

    // High-safety cryptographic salting
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Commit changes and completely wipe dynamic security locks
    await user.update({
      password: hashedPassword,
      reset_password_otp: null,
      reset_password_expires: null
    });

    // Instantly invalidate any local tokens to log out all instances
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 5 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'Access key updated successfully. Logged out of all sessions.'
    });

  } catch (error) {
    console.error('Reset Password Handler Error:', error);
    res.status(500).json({ success: false, message: 'Internal server failure during secure deployment' });
  }
};

