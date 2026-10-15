const router = require("express").Router();
const StudentProfile = require("../models/StudentProfile");
const { authenticate, authorize } = require("../middleware/auth");

// GET /api/students/profile
router.get("/profile", authenticate, authorize("Student"), async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user.id });
    res.json({ success: true, profile });
  } catch (err) {
    next(err);
  }
});

// PUT /api/students/profile
router.put("/profile", authenticate, authorize("Student"), async (req, res, next) => {
  try {
    const allowed = ["gpa", "resumeLink", "skills", "department", "graduationYear"];
    const update = {};

    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }

    if (update.gpa !== undefined && (update.gpa < 0 || update.gpa > 10)) {
      return res.status(400).json({ success: false, message: "GPA must be between 0 and 10" });
    }

    const profile = await StudentProfile.findOneAndUpdate(
      { user: req.user.id },
      { $set: update },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ success: true, profile });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
