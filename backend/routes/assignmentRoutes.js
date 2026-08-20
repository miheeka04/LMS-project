const express = require("express");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const Course = require("../models/Course");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// List assignments for a course
router.get("/course/:courseId", protect, async (req, res) => {
  try {
    const assignments = await Assignment.find({ course: req.params.courseId }).sort({ createdAt: -1 });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create assignment (teacher)
router.post("/", protect, authorize("teacher", "admin"), async (req, res) => {
  try {
    const { course, title, description, dueDate, maxMarks } = req.body;
    const assignment = await Assignment.create({
      course,
      title,
      description,
      dueDate,
      maxMarks,
      createdBy: req.user._id,
    });
    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", protect, authorize("teacher", "admin"), async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    await Submission.deleteMany({ assignment: req.params.id });
    res.json({ message: "Assignment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Submit assignment (student)
router.post("/:id/submit", protect, authorize("student"), async (req, res) => {
  try {
    const { content, fileUrl } = req.body;
    const submission = await Submission.findOneAndUpdate(
      { assignment: req.params.id, student: req.user._id },
      { content, fileUrl, submittedAt: new Date(), status: "submitted" },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(submission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// View all submissions for an assignment (teacher)
router.get("/:id/submissions", protect, authorize("teacher", "admin"), async (req, res) => {
  try {
    const submissions = await Submission.find({ assignment: req.params.id }).populate(
      "student",
      "name email"
    );
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// View own submission (student)
router.get("/:id/my-submission", protect, authorize("student"), async (req, res) => {
  try {
    const submission = await Submission.findOne({ assignment: req.params.id, student: req.user._id });
    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Grade a submission (teacher)
router.put("/submissions/:submissionId/grade", protect, authorize("teacher", "admin"), async (req, res) => {
  try {
    const { marksAwarded, feedback } = req.body;
    const submission = await Submission.findByIdAndUpdate(
      req.params.submissionId,
      { marksAwarded, feedback, status: "graded" },
      { new: true }
    );
    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
