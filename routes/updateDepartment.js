const express = require("express");
const verifyToken = require("../utils/verifyToken");
const verifyIfUserAdmin = require("../utils/verifyAdmin");
const { updateDepartment } = require("../models/USM");

const router = express.Router();

// Register route
router.post("/", verifyToken, verifyIfUserAdmin, async (req, res, next) => {
  try {
    const { department_code, department_name, pre_department_code } = req.body;

    await updateDepartment({
      department_code,
      department_name,
      pre_department_code,
    });

    res.status(201).json({ message: "USM Department updated successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
