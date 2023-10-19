const express = require("express");
const verifyToken = require("../utils/verifyToken");
const { deleteStudent } = require("../models/OtherSchools");
const { isUsmIDValid } = require("../utils/validation");

const router = express.Router();

// Register route
router.delete("/", verifyToken, async (req, res, next) => {
  try {
    const { student_id } = req.body;

    if (!isUsmIDValid(student_id)) {
      throw { msg: "Please enter valid USM ID", status: 400 };
    }

    await deleteStudent({
      student_id,
    });

    res.status(201).json({ message: "Student deleted successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
