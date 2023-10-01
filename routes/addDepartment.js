const express = require("express");
const verifyToken = require("../utils/verifyToken");
const verifyIfUserAdmin = require("../utils/verifyAdmin");
const { addDepartment } = require("../models/USM");

const router = express.Router();

// Register route
router.post("/", verifyToken, verifyIfUserAdmin, async (req, res, next) => {
  try {
    const { department_code, department_name } = req.body;

    await addDepartment({
      department_code,
      department_name,
    });

    res.status(201).json({ message: "USM Department registered successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
