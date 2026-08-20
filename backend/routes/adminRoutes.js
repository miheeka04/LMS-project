const express = require("express");
const User = require("../models/User");
const Course = require("../models/Course");
const Assignment = require("../models/Assignment");
const Quiz = require("../models/Quiz");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect, authorize("admin"));

// Dashboard summary counts
router.get("/summary", async (req, res) => {
  try {
    const [teachers, students, courses, assignments, quizzes] = await Promise.all([
      User.countDocuments({ role: "teacher" }),
      User.countDocuments({ role: "student" }),
      Course.countDocuments(),
      Assignment.countDocuments(),
      Quiz.countDocuments(),
    ]);
    res.json({ teachers, students, courses, assignments, quizzes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// List all users, optionally filtered by role: /api/admin/users?role=teacher
router.get("/users", async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Activate / deactivate a user
router.put("/users/:id/toggle-active", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? "activated" : "deactivated"}`, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a user
router.delete("/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
