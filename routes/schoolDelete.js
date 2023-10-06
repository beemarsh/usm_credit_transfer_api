const express = require("express");
const verifyToken = require("../utils/verifyToken");
const verifyIfUserAdmin = require("../utils/verifyAdmin");
const { deleteSchool } = require("../models/OtherSchools");

const router = express.Router();

// Register route
router.delete("/", verifyToken, verifyIfUserAdmin, async (req, res, next) => {
  try {
    const { code } = req.body;

    await deleteSchool({
      code,
    });

    res.status(201).json({ message: "School deleted successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
