const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true },
    type: { type: String, enum: ["pdf", "video", "note", "link"], default: "note" },
    fileUrl: { type: String, default: "" },
    content: { type: String, default: "" },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Material", materialSchema);
