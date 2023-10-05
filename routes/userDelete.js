const express = require("express");
const userModel = require("../models/User");
const verifyToken = require("../utils/verifyToken");
const verifyIfUserAdmin = require("../utils/verifyAdmin");

const router = express.Router();

// Register route
router.delete("/", verifyToken, verifyIfUserAdmin, async (req, res, next) => {
  try {
    const { email } = req.body;

    await userModel.deleteUser({
      email,
    });

    res.status(201).json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
