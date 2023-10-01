const express = require("express");
const verifyToken = require("../utils/verifyToken");
const verifyIfUserAdmin = require("../utils/verifyAdmin");
const { addMajor } = require("../models/USM");

const router = express.Router();

// Register route
router.post("/", verifyToken, verifyIfUserAdmin, async (req, res, next) => {
  try {
    const { major_code, major_name, department } = req.body;

    await addMajor({
      department,
      major_code,
      major_name,
    });

    res.status(201).json({ message: "USM Major registered successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
