const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  companyName: { type: String, required: true, trim: true },
  jobProfile: { type: String, required: true, trim: true, maxlength: 150 },
  description: { type: String, trim: true, maxlength: 5000 },
  eligibility: {
    minGpa: { type: Number, min: 0, max: 10 },
    departments: [{ type: String, trim: true }],
    graduationYears: [{ type: Number }]
  },
  packageCtc: { type: String, required: true, trim: true, maxlength: 100 },
  deadline: { type: Date, required: true },
  registeredStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }]
}, { timestamps: true });

jobSchema.index({ deadline: 1 });
jobSchema.index({ company: 1 });

module.exports = mongoose.model("Job", jobSchema);
