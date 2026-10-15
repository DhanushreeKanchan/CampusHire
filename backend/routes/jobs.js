const router = require("express").Router();
const Job = require("../models/Job");
const Application = require("../models/Application");
const { authenticate, authorize } = require("../middleware/auth");

// GET /api/jobs - authenticated users can view jobs
router.get("/", authenticate, async (req, res, next) => {
  try {
    const jobs = await Job.find({ deadline: { $gte: new Date() } })
      .populate("company", "name email")
      .sort({ deadline: 1 });

    res.json({ success: true, jobs });
  } catch (err) {
    next(err);
  }
});

// POST /api/jobs - Company only
router.post("/", authenticate, authorize("Company"), async (req, res, next) => {
  try {
    const { jobProfile, description, eligibility, packageCtc, deadline } = req.body;

    if (!jobProfile || !packageCtc || !deadline) {
      return res.status(400).json({ success: false, message: "Job profile, package and deadline are required" });
    }

    if (new Date(deadline) <= new Date()) {
      return res.status(400).json({ success: false, message: "Deadline must be in the future" });
    }

    const job = await Job.create({
      company: req.user.id,
      companyName: req.user.name,
      jobProfile,
      description,
      eligibility,
      packageCtc,
      deadline
    });

    res.status(201).json({ success: true, job });
  } catch (err) {
    next(err);
  }
});

// GET /api/jobs/company/my-jobs - Company only
router.get("/company/my-jobs", authenticate, authorize("Company"), async (req, res, next) => {
  try {
    const jobs = await Job.find({ company: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, jobs });
  } catch (err) {
    next(err);
  }
});

// GET /api/jobs/:id/applicants - Company owner or Admin
router.get("/:id/applicants", authenticate, authorize("Company", "Admin"), async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    if (req.user.role === "Company" && job.company.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "You do not own this job" });
    }

    const applications = await Application.find({ job: job._id })
      .populate("student", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, job, applications });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
