const express = require("express");
const verifyToken = require("../utils/verifyToken");
const verifyIfUserAdmin = require("../utils/verifyAdmin");
const { updateSchool } = require("../models/OtherSchools");
const { updateUSMCourse } = require("../models/USM");

const router = express.Router();

// Register route
router.post("/", verifyToken, verifyIfUserAdmin, async (req, res, next) => {
  try {
    const { course_hours, course_id, course_name, department, pre_course_id } =
      req.body;

    await updateUSMCourse({
      course_hours,
      course_id,
      course_name,
      department,
      pre_course_id,
    });

    res.status(201).json({ message: "Course updated successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
