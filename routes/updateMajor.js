const express = require("express");
const verifyToken = require("../utils/verifyToken");
const verifyIfUserAdmin = require("../utils/verifyAdmin");
const { updateMajor } = require("../models/USM");

const router = express.Router();

// Register route
router.post("/", verifyToken, verifyIfUserAdmin, async (req, res, next) => {
  try {
    const { department, major_code, major_name, pre_major_code } = req.body;

    await updateMajor({
      department,
      major_code,
      major_name,
      pre_major_code,
    });

    res.status(201).json({ message: "Major updated successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
