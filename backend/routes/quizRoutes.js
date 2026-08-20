const express = require("express");
const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// List quizzes for a course
router.get("/course/:courseId", protect, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ course: req.params.courseId }).select(
      req.user.role === "student" ? "-questions.correctOptionIndex" : ""
    );
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single quiz (hide correct answers from students)
router.get("/:id", protect, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    if (req.user.role === "student") {
      const sanitized = {
        _id: quiz._id,
        title: quiz.title,
        course: quiz.course,
        questions: quiz.questions.map((q) => ({
          _id: q._id,
          questionText: q.questionText,
          options: q.options,
        })),
      };
      return res.json(sanitized);
    }
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create quiz (teacher)
router.post("/", protect, authorize("teacher", "admin"), async (req, res) => {
  try {
    const { course, title, questions } = req.body;
    if (!questions || !questions.length) {
      return res.status(400).json({ message: "At least one question is required" });
    }
    const quiz = await Quiz.create({ course, title, questions, createdBy: req.user._id });
    res.status(201).json(quiz);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", protect, authorize("teacher", "admin"), async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    await QuizAttempt.deleteMany({ quiz: req.params.id });
    res.json({ message: "Quiz deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Attempt quiz (student) - answers: [optionIndex, optionIndex, ...] in question order
router.post("/:id/attempt", protect, authorize("student"), async (req, res) => {
  try {
    const { answers } = req.body;
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    let score = 0;
    quiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctOptionIndex) score += 1;
    });

    const attempt = await QuizAttempt.findOneAndUpdate(
      { quiz: quiz._id, student: req.user._id },
      { answers, score, totalQuestions: quiz.questions.length, attemptedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json(attempt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Student's own results across all quizzes
router.get("/results/mine", protect, authorize("student"), async (req, res) => {
  try {
    const results = await QuizAttempt.find({ student: req.user._id }).populate("quiz", "title course");
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Teacher: view all attempts for a quiz
router.get("/:id/results", protect, authorize("teacher", "admin"), async (req, res) => {
  try {
    const results = await QuizAttempt.find({ quiz: req.params.id }).populate("student", "name email");
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
