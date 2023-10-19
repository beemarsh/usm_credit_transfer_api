const express = require("express");
const verifyToken = require("../utils/verifyToken");
const {
  findAllStudentCourses,
} = require("../models/OtherSchools");
const { isUsmIDValid } = require("../utils/validation");

const router = express.Router();

// Register route
router.post("/", verifyToken, async (req, res, next) => {
  try {
    const { student_id } = req.body;

    if (!isUsmIDValid(student_id)) {
      throw { msg: "Please select a valid student ID", status: 400 };
    }

    let retrieved_data = await findAllStudentCourses({
      student_id,
    });

    res.status(201).json(retrieved_data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
