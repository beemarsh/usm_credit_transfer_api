const express = require("express");
const verifyToken = require("../utils/verifyToken");
const verifyIfUserAdmin = require("../utils/verifyAdmin");
const { findOtherCoursesWithFilter } = require("../models/OtherSchools");

const router = express.Router();

// Register route
router.post("/", verifyToken, verifyIfUserAdmin, async (req, res, next) => {
  try {
    const { course_id, school, name, usm_eqv } = req.body;

    let retrieved = await findOtherCoursesWithFilter({
      course_id,
      school,
      name,
      usm_eqv,
    });

    res.status(201).json(retrieved);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
