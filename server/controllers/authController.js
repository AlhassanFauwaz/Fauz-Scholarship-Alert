import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';
import sendSMS from '../utils/sendSMS.js';

// Generate JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const createVerificationCode = () =>
  crypto.randomInt(100000, 1000000).toString();

const hashVerificationCode = (code) =>
  crypto.createHash('sha256').update(code).digest('hex');

const sendVerificationEmail = async (user, code) => {
  await sendEmail({
    to: user.email,
    subject: 'Verify your Fauz Scholarship Alert account',
    preheader: `Your verification code is ${code}. It expires in 24 hours.`,
    html: `<h1 style="margin:0 0 12px;font-size:27px;line-height:1.25;color:#0a2b3c;">Welcome, ${user.fullName}!</h1><p style="margin:0 0 24px;">You are one quick step away from discovering opportunities tailored for you. Enter this verification code in the app:</p><div style="margin:0 0 24px;padding:18px;border-radius:12px;background:#edf9f1;text-align:center;font-size:30px;font-weight:800;letter-spacing:8px;color:#0a2b3c;">${code}</div><p style="margin:0;">This code expires in <strong>24 hours</strong>. If you did not create an account, you can safely ignore this email.</p>`,
    text: `Welcome, ${user.fullName}! Your Fauz Scholarship Alert verification code is ${code}. It expires in 24 hours.`,
  });
};

// @route   POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Create user (phone optional)
    const user = await User.create({
      fullName,
      email,
      phone,
      password,
    });

    // Generate email verification token
    const verificationCode = createVerificationCode();
    user.emailVerificationToken = hashVerificationCode(verificationCode);
    user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save({ validateBeforeSave: false });

    // Welcome every new registrant by email and, when provided, SMS.
    let verificationEmailSent = true;
    try {
      await sendVerificationEmail(user, verificationCode);
      /* await sendEmail({
        to: user.email,
        subject: 'Welcome to SOAS — verify your email',
        html: `<h2>Welcome to SOAS, ${user.fullName}!</h2><p>Your scholarship journey starts here.</p><p><a href="${verificationUrl}">Verify your email address</a></p>`,
        text: `Welcome to SOAS, ${user.fullName}! Your scholarship journey starts here. Verify your email: ${verificationUrl}`,
      }); */
    } catch (err) {
      console.error('Verification email failed:', err.message);
      verificationEmailSent = false;
    }

    if (user.phone) {
      sendSMS(user.phone, `SOAS: Welcome, ${user.fullName}! Your scholarship journey starts here.`)
        .catch((err) => console.error('Welcome SMS failed:', err.message));
    }

    const token = signToken(user._id);

    res.status(201).json({
      token,
      verificationEmailSent,
      message: verificationEmailSent
        ? 'A verification code has been sent to your email.'
        : 'Your account was created, but the verification email could not be sent. Please request a new code.',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        emailVerified: user.emailVerified,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        emailVerified: user.emailVerified,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   POST /api/auth/resend-verification
// @access  Private (user must be logged in)
export const resendVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    const verificationCode = createVerificationCode();
    user.emailVerificationToken = hashVerificationCode(verificationCode);
    user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    await sendVerificationEmail(user, verificationCode);

    res.json({ message: 'Verification email sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   POST /api/auth/verify-email
export const verifyEmail = async (req, res) => {
  try {
    const { code } = req.body;
    if (!/^\d{6}$/.test(code || '')) {
      return res.status(400).json({ message: 'Enter the six-digit verification code.' });
    }

    const user = await User.findOne({
      _id: req.user.id,
      emailVerificationToken: hashVerificationCode(code),
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
