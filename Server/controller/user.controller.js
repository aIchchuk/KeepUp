import User from "../models/user.model.js";
import Activity from "../models/activity.model.js";
import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";
import { sendOtpEmail } from "../utils/mail.util.js";

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Password Validation Utility
const isPasswordStrong = (password) => {
    // Min 8 chars, at least one uppercase, one lowercase, one number, and one special character
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongRegex.test(password);
};

// Register
export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "All fields required" });

    if (!isPasswordStrong(password)) {
        return res.status(400).json({
            message: "Password too weak. Must be at least 8 characters long and include uppercase, lowercase, number, and special character."
        });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashedPassword });

    await Activity.create({ user: user._id, actionType: "register", ipAddress: req.ip });

    res.status(201).json({ token: generateToken(user._id), user: { id: user._id, name: user.name, email: user.email } });
};


// Login
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    if (user.mfaEnabled) {
        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.mfaCode = await bcrypt.hash(otp, 10);
        user.mfaExpires = Date.now() + 10 * 60 * 1000; // 10 mins
        await user.save();

        await sendOtpEmail(user.email, otp);

        return res.status(200).json({ mfaRequired: true, email: user.email, message: "MFA code sent to email" });
    }

    await Activity.create({ user: user._id, actionType: "login", ipAddress: req.ip });

    res.json({ token: generateToken(user._id), user: { id: user._id, name: user.name, email: user.email } });
};


// Verify MFA
export const verifyMfa = async (req, res) => {
    const { email, code } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.mfaCode || user.mfaExpires < Date.now()) {
        return res.status(400).json({ message: "MFA code expired or invalid" });
    }

    const isMatch = await bcrypt.compare(code, user.mfaCode);
    if (!isMatch) return res.status(400).json({ message: "Invalid MFA code" });

    // Clear MFA code after successful login
    user.mfaCode = undefined;
    user.mfaExpires = undefined;
    await user.save();

    res.json({ token: generateToken(user._id), user: { id: user._id, name: user.name, email: user.email } });
};

// Enable MFA
export const toggleMfa = async (req, res) => {
    const user = await User.findById(req.user._id);
    user.mfaEnabled = !user.mfaEnabled;
    await user.save();
    res.json({ message: `MFA ${user.mfaEnabled ? 'enabled' : 'disabled'} successfully`, mfaEnabled: user.mfaEnabled });
};

// Get Profile
export const getProfile = async (req, res) => {
    res.json(req.user);
};
