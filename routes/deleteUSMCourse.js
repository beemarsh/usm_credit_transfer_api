const express = require("express");
const verifyToken = require("../utils/verifyToken");
const verifyIfUserAdmin = require("../utils/verifyAdmin");
const { deleteUSMCourse } = require("../models/USM");

const router = express.Router();

// Register route
router.delete("/", verifyToken, verifyIfUserAdmin, async (req, res, next) => {
  try {
    const { course_id } = req.body;

    await deleteUSMCourse({
      course_id,
    });

    res.status(201).json({ message: "Course deleted successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
