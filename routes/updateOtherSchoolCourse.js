const express = require("express");
const verifyToken = require("../utils/verifyToken");
const verifyIfUserAdmin = require("../utils/verifyAdmin");
const { updateOtherSchoolCourses } = require("../models/OtherSchools");

const router = express.Router();

// Register route
router.post("/", verifyToken, verifyIfUserAdmin, async (req, res, next) => {
  try {
    const {
      course_id,
      credit_hours,
      name,
      pre_course_id,
      pre_school,
      school,
      usm_eqv,
    } = req.body;

    await updateOtherSchoolCourses({
      course_id,
      credit_hours,
      name,
      pre_course_id,
      pre_school,
      school,
      usm_eqv,
    });

    res.status(201).json({ message: "Courses updated successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
