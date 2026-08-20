const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    records: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        present: { type: Boolean, default: false },
      },
    ],
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

attendanceSchema.index({ course: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
