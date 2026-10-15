const router = require("express").Router();
const Application = require("../models/Application");
const Job = require("../models/Job");
const StudentProfile = require("../models/StudentProfile");
const { authenticate, authorize } = require("../middleware/auth");

// POST /api/applications/:jobId - Student applies
router.post("/:jobId", authenticate, authorize("Student"), async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    if (job.deadline < new Date()) {
      return res.status(400).json({ success: false, message: "Application deadline has passed" });
    }

    const profile = await StudentProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(400).json({ success: false, message: "Complete your student profile before applying" });
    }

    const { minGpa, departments = [], graduationYears = [] } = job.eligibility || {};

    if (minGpa != null && (profile.gpa == null || profile.gpa < minGpa)) {
      return res.status(400).json({ success: false, message: `Minimum GPA required is ${minGpa}` });
    }

    if (departments.length && !departments.includes(profile.department)) {
      return res.status(400).json({ success: false, message: "Your department is not eligible" });
    }

    if (graduationYears.length && !graduationYears.includes(profile.graduationYear)) {
      return res.status(400).json({ success: false, message: "Your graduation year is not eligible" });
    }

    const application = await Application.create({
      student: req.user.id,
      job: job._id
    });

    await Job.findByIdAndUpdate(job._id, {
      $addToSet: { registeredStudents: req.user.id }
    });

    res.status(201).json({ success: true, application });
  } catch (err) {
    next(err);
  }
});

// GET /api/applications/my - Student's applications
router.get("/my", authenticate, authorize("Student"), async (req, res, next) => {
  try {
    const applications = await Application.find({ student: req.user.id })
      .populate("job", "companyName jobProfile packageCtc deadline")
      .sort({ createdAt: -1 });

    res.json({ success: true, applications });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/applications/:id/status - Admin updates status
router.patch("/:id/status", authenticate, authorize("Admin"), async (req, res, next) => {
  try {
    const allowed = ["Applied", "Shortlisted", "Selected", "Rejected"];
    if (!allowed.includes(req.body.status)) {
      return res.status(400).json({ success: false, message: "Invalid application status" });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    ).populate("student", "name email");

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    res.json({ success: true, application });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
