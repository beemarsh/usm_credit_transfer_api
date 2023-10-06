const express = require("express");
const verifyToken = require("../utils/verifyToken");
const verifyIfUserAdmin = require("../utils/verifyAdmin");
const { deleteDepartment } = require("../models/USM");

const router = express.Router();

// Register route
router.delete("/", verifyToken, verifyIfUserAdmin, async (req, res, next) => {
  try {
    const { department_code } = req.body;

    await deleteDepartment({
      department_code,
    });

    res.status(201).json({ message: "Department deleted successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
