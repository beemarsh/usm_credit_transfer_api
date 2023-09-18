const express = require("express");
const verifyToken = require("../utils/verifyToken");
const { getInitialPropsToAddStudent } = require("../models/OtherSchools");

const router = express.Router();

router.post("/", verifyToken, async (req, res, next) => {
  try {
    query_data = await getInitialPropsToAddStudent();

    res.status(200).json(query_data?.result);
  } catch (error) {
    console.error("Couldn't fetch Initial Props to add student:", error);
    next(error);
  }
});

module.exports = router;
