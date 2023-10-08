const express = require("express");
const verifyToken = require("../utils/verifyToken");
const { updateStudentCourseVerifiedStatus } = require("../models/OtherSchools");

const router = express.Router();

// Register route
router.post("/", verifyToken, async (req, res, next) => {
  try {
    const { course_id, school, status, student_id } = req.body;

    await updateStudentCourseVerifiedStatus({
      course_id,
      school,
      status,
      student_id,
    });

    res.status(201).json({ message: "Student Course updated successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
