const express = require("express");
const verifyToken = require("../utils/verifyToken");
const { markSelectedCourse } = require("../models/OtherSchools");
const { isUsmIDValid } = require("../utils/validation");

const router = express.Router();

// Register route
router.post("/", verifyToken, async (req, res, next) => {
  try {
    const { student_id, status, courses } = req.body;

    if (!isUsmIDValid(student_id)) {
      throw { msg: "Please select a valid student ID", status: 400 };
    }

    if (!(status === true || status === false)) {
      throw { msg: "Please select a status mark", status: 400 };
    }
    if (!(courses || courses?.length > 0)) {
      throw { msg: "Please select a valid course", status: 400 };
    }

    await markSelectedCourse({
      student_id,
      status,
      courses,
    });

    res
      .status(201)
      .json({ message: "Succesfully updated the student course record" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
