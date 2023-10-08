const express = require("express");
const verifyToken = require("../utils/verifyToken");
const { markAllCourses } = require("../models/OtherSchools");
const { isUsmIDValid } = require("../utils/validation");

const router = express.Router();

// Register route
router.post("/", verifyToken, async (req, res, next) => {
  try {
    const { student_id, status } = req.body;

    if (!isUsmIDValid(student_id)) {
      throw { msg: "Please select a valid student ID", status: 400 };
    }
    if (!(status === true || status === false)) {
      throw { msg: "Please select a status mark", status: 400 };
    }

    await markAllCourses({
      student_id,
      status,
    });

    res
      .status(201)
      .json({ message: "Student all courses marked as completed" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
