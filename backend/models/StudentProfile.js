const mongoose = require("mongoose");

const studentProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  gpa: { type: Number, min: 0, max: 10 },
  resumeLink: { type: String, trim: true },
  skills: [{ type: String, trim: true }],
  department: { type: String, trim: true, maxlength: 100 },
  graduationYear: { type: Number, min: 2000, max: 2100 }
}, { timestamps: true });

module.exports = mongoose.model("StudentProfile", studentProfileSchema);
