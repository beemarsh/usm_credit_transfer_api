const express = require("express");
const verifyToken = require("../utils/verifyToken");
const verifyIfUserAdmin = require("../utils/verifyAdmin");
const { updateSchool } = require("../models/OtherSchools");

const router = express.Router();

// Register route
router.post("/", verifyToken, verifyIfUserAdmin, async (req, res, next) => {
  try {
    const { pre_code, code, name, address } = req.body;

    await updateSchool({
      pre_code,
      code,
      name,
      address,
    });

    res.status(201).json({ message: "School updated successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
