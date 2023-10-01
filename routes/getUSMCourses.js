const express = require("express");
const verifyToken = require("../utils/verifyToken");
const verifyIfUserAdmin = require("../utils/verifyAdmin");
const {
  findDepartmentsWithFilter,
  findUSMCoursesWithFilter,
} = require("../models/USM");

const router = express.Router();

// Register route
router.post("/", verifyToken, verifyIfUserAdmin, async (req, res, next) => {
  try {
    const { department, course_id, course_name } = req.body;

    let retrieved = await findUSMCoursesWithFilter({
      department,
      course_id,
      course_name,
    });

    res.status(201).json(retrieved);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
