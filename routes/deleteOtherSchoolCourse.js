const express = require("express");
const verifyToken = require("../utils/verifyToken");
const verifyIfUserAdmin = require("../utils/verifyAdmin");
const {
  deleteOtherSchoolCourse,
} = require("../models/OtherSchools");

const router = express.Router();

// Register route
router.delete("/", verifyToken, verifyIfUserAdmin, async (req, res, next) => {
  try {
    const { course_id, school } = req.body;

    await deleteOtherSchoolCourse({
      course_id,
      school,
    });

    res.status(201).json({ message: "Course deleted successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
