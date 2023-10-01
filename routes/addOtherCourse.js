const express = require("express");
const { addSchool, addOtherSchoolCourses } = require("../models/OtherSchools");
const verifyToken = require("../utils/verifyToken");
const verifyIfUserAdmin = require("../utils/verifyAdmin");

const router = express.Router();

// Register route
router.post("/", verifyToken, verifyIfUserAdmin, async (req, res, next) => {
  try {
    const { course_id, school, name, usm_eqv, credit_hours } = req.body;

    await addOtherSchoolCourses({
      course_id,
      school,
      name,
      usm_eqv,
      credit_hours,
    });

    res.status(201).json({ message: "Course registered successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
