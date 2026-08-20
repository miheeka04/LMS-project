const express = require("express");
const Course = require("../models/Course");
const Material = require("../models/Material");
const Announcement = require("../models/Announcement");
const Attendance = require("../models/Attendance");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

/* ---------------------------- COURSES ---------------------------- */

// List courses (teacher sees own, student sees enrolled + available, admin sees all)
router.get("/", protect, async (req, res) => {
  try {
    let courses;
    if (req.user.role === "teacher") {
      courses = await Course.find({ teacher: req.user._id }).populate("teacher", "name email");
    } else if (req.user.role === "admin") {
      courses = await Course.find().populate("teacher", "name email");
    } else {
      courses = await Course.find().populate("teacher", "name email");
    }
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create course (teacher or admin)
router.post("/", protect, authorize("teacher", "admin"), async (req, res) => {
  try {
    const { title, description, coverColor } = req.body;
    if (!title) return res.status(400).json({ message: "Course title is required" });
    const course = await Course.create({
      title,
      description,
      coverColor,
      teacher: req.user.role === "teacher" ? req.user._id : req.body.teacher,
    });
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Enroll in a course (student)
router.post("/:id/enroll", protect, authorize("student"), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (!course.students.includes(req.user._id)) {
      course.students.push(req.user._id);
      await course.save();
    }
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { enrolledCourses: course._id } });
    res.json({ message: "Enrolled successfully", course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Course details
router.get("/:id", protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("teacher", "name email")
      .populate("students", "name email");
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete course (teacher who owns it, or admin)
router.delete("/:id", protect, authorize("teacher", "admin"), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (req.user.role === "teacher" && String(course.teacher) !== String(req.user._id)) {
      return res.status(403).json({ message: "You do not own this course" });
    }
    await course.deleteOne();
    res.json({ message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* --------------------------- MATERIALS ---------------------------- */

router.get("/:id/materials", protect, async (req, res) => {
  try {
    const materials = await Material.find({ course: req.params.id }).sort({ createdAt: -1 });
    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:id/materials", protect, authorize("teacher", "admin"), async (req, res) => {
  try {
    const { title, type, fileUrl, content } = req.body;
    const material = await Material.create({
      course: req.params.id,
      title,
      type,
      fileUrl,
      content,
      uploadedBy: req.user._id,
    });
    res.status(201).json(material);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/materials/:materialId", protect, authorize("teacher", "admin"), async (req, res) => {
  try {
    await Material.findByIdAndDelete(req.params.materialId);
    res.json({ message: "Material deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ------------------------- ANNOUNCEMENTS --------------------------- */

// Global (course = null) + course-specific announcements relevant to the user
router.get("/announcements/all", protect, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === "student") {
      filter = { $or: [{ course: null }, { course: { $in: req.user.enrolledCourses } }] };
    } else if (req.user.role === "teacher") {
      const myCourses = await Course.find({ teacher: req.user._id }).select("_id");
      filter = { $or: [{ course: null }, { course: { $in: myCourses.map((c) => c._id) } }] };
    }
    const announcements = await Announcement.find(filter)
      .populate("postedBy", "name role")
      .populate("course", "title")
      .sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/announcements", protect, authorize("teacher", "admin"), async (req, res) => {
  try {
    const { title, message, course } = req.body;
    const announcement = await Announcement.create({
      title,
      message,
      course: course || null,
      postedBy: req.user._id,
    });
    res.status(201).json(announcement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* --------------------------- ATTENDANCE ----------------------------- */

router.post("/:id/attendance", protect, authorize("teacher", "admin"), async (req, res) => {
  try {
    const { date, records } = req.body; // records: [{ student, present }]
    const attendance = await Attendance.findOneAndUpdate(
      { course: req.params.id, date },
      { course: req.params.id, date, records, markedBy: req.user._id },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id/attendance", protect, async (req, res) => {
  try {
    const attendance = await Attendance.find({ course: req.params.id }).sort({ date: -1 });
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
