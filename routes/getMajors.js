const express = require("express");
const verifyToken = require("../utils/verifyToken");
const verifyIfUserAdmin = require("../utils/verifyAdmin");
const {
  findDepartmentsWithFilter,
  findMajorsWithFilter,
} = require("../models/USM");

const router = express.Router();

// Register route
router.post("/", verifyToken, verifyIfUserAdmin, async (req, res, next) => {
  try {
    const { major_code, major_name, department } = req.body;

    let retrieved = await findMajorsWithFilter({
      department,
      major_code,
      major_name,
    });

    res.status(201).json(retrieved);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
