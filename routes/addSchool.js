const express = require("express");
const { addSchool } = require("../models/OtherSchools");
const verifyToken = require("../utils/verifyToken");
const verifyIfUserAdmin = require("../utils/verifyAdmin");

const router = express.Router();

// Register route
router.post("/", verifyToken, verifyIfUserAdmin, async (req, res, next) => {
  try {
    const { name, code, address } = req.body;

    await addSchool({ name, code, address });

    res.status(201).json({ message: "School registered successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
