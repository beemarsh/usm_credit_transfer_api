const express = require("express");
const verifyToken = require("../utils/verifyToken");
const verifyIfUserAdmin = require("../utils/verifyAdmin");
const { findDepartmentsWithFilter } = require("../models/USM");

const router = express.Router();

// Register route
router.post("/", verifyToken, verifyIfUserAdmin, async (req, res, next) => {
  try {
    const { department_name, department_code } = req.body;

    let retrieved = await findDepartmentsWithFilter({
      department_code,
      department_name,
    });

    res.status(201).json(retrieved);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
