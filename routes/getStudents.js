const express = require("express");
const verifyToken = require("../utils/verifyToken");
const { findStudentsWithFilter } = require("../models/OtherSchools");

const router = express.Router();

// Register route
router.post("/", verifyToken, async (req, res, next) => {
  try {
    const { q, page, verified } = req.body;

    let retrieved = await findStudentsWithFilter({
      q,
      page,
      verified,
    });

    res.status(201).json(retrieved);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
