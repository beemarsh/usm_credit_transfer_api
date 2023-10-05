const express = require("express");
const userModel = require("../models/User");
const verifyToken = require("../utils/verifyToken");
const verifyIfUserAdmin = require("../utils/verifyAdmin");

const router = express.Router();

// Register route
router.post("/", verifyToken, verifyIfUserAdmin, async (req, res, next) => {
  try {
    const { email } = req.body;

    await userModel.changeUserActive({
      email,
    });

    res.status(201).json({ message: "User status updated successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
