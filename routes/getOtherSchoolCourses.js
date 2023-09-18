const express = require("express");
const verifyToken = require("../utils/verifyToken");
const { getOtherSchoolCourses } = require("../models/OtherSchools");

const router = express.Router();

router.post("/", verifyToken, async (req, res, next) => {
  try {
    const { school } = req.body;
    query_data = await getOtherSchoolCourses(school);

    res.status(200).json(query_data?.result);
  } catch (error) {
    console.error("Couldn't find courses for the selected school:", error);
    next(error);
  }
});

module.exports = router;
