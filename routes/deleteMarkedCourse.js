const express = require("express");
const verifyToken = require("../utils/verifyToken");
const { deleteMarkedCourses } = require("../models/OtherSchools");
const { isUsmIDValid } = require("../utils/validation");

const router = express.Router();

// Register route
router.delete("/", verifyToken, async (req, res, next) => {
  try {
    const { courses, student_id } = req.body;

    if (!isUsmIDValid(student_id)) {
      throw { msg: "Please select a valid student ID", status: 400 };
    }

    if (!(courses || courses?.length > 0)) {
      throw { msg: "Please select a valid course", status: 400 };
    }

    await deleteMarkedCourses({
      student_id,
      courses,
    });

    res.status(201).json({ message: "Student Course deleted successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
