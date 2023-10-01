const express = require("express");
const { findUsersWithFilter } = require("../models/User");
const verifyToken = require("../utils/verifyToken");
const verifyIfUserAdmin = require("../utils/verifyAdmin");

const router = express.Router();

// Register route
router.post("/", verifyToken, verifyIfUserAdmin, async (req, res, next) => {
  try {
    const { email, name, department } = req.body;

    let retrieved = await findUsersWithFilter({
      email,
      name,
      department,
    });

    res.status(201).json(retrieved);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
