const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const router = express.Router();

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// @route  POST /api/auth/register
// @desc   Register a new user (student, teacher, or admin) and log them in immediately
router.post("/register", async (req, res) => {
  try {
    const { name, email, mobile, role, password, confirmPassword } = req.body;

    if (!name || !email || !mobile || !role || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Password and Confirm Password do not match" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    if (!/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ message: "Please enter a valid 10-digit mobile number" });
    }
    if (!["admin", "teacher", "student"].includes(role)) {
      return res.status(400).json({ message: "Invalid role selected" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      mobile,
      role,
      password,
    });

    const token = signToken(user);
    res.status(201).json({
      message: "Registration successful",
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
});

// @route  POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ message: "Email, password and role are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    if (user.role !== role) {
      return res.status(401).json({ message: `No ${role} account found with this email` });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: "Your account has been deactivated. Contact admin." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

    const token = signToken(user);
    res.json({ message: "Login successful", token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

// @route  GET /api/auth/me
router.get("/me", protect, async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
});

module.exports = router;
