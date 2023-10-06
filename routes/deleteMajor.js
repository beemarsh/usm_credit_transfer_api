const express = require("express");
const verifyToken = require("../utils/verifyToken");
const verifyIfUserAdmin = require("../utils/verifyAdmin");
const { deleteMajor } = require("../models/USM");

const router = express.Router();

// Register route
router.delete("/", verifyToken, verifyIfUserAdmin, async (req, res, next) => {
  try {
    const { major_code } = req.body;

    await deleteMajor({
      major_code,
    });

    res.status(201).json({ message: "Major deleted successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
