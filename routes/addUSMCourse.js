const express = require("express");
const verifyToken = require("../utils/verifyToken");
const verifyIfUserAdmin = require("../utils/verifyAdmin");
const { addUSMCourse } = require("../models/USM");

const router = express.Router();

// Register route
router.post("/", verifyToken, verifyIfUserAdmin, async (req, res, next) => {
  try {
    const { department, course_id, course_name, course_hours } = req.body;

    await addUSMCourse({
      department,
      course_id,
      course_name,
      course_hours,
    });

    res.status(201).json({ message: "USM Course registered successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
