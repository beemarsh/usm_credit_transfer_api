const express = require("express");
const verifyToken = require("../utils/verifyToken");
const verifyIfUserAdmin = require("../utils/verifyAdmin");
const { findMajorsWithFilter } = require("../models/USM");

const router = express.Router();

// Register route
router.post("/", verifyToken, verifyIfUserAdmin, async (req, res, next) => {
  try {
    const { q, page } = req.body;

    let retrieved = await findMajorsWithFilter({
      q,
      page,
    });

    res.status(201).json(retrieved);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
