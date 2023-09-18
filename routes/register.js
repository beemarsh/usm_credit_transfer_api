const express = require("express");
const bcrypt = require("bcrypt");
const userModel = require("../models/User");

const router = express.Router();

// Register route
router.post("/", async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      profile_picture,
      role,
      department,
      first_name,
      last_name,
      is_staff,
    } = req.body;

    // Check if the user already exists by username or email
    const existingUser = await userModel.findByUsernameOrEmail({
      username,
      email,
    });

    if (existingUser != null) {
      return res.status(409).json({ message: "User already exists" });
    }

    const newUser = await userModel.createUser({
      username,
      email,
      password,
      profile_picture,
      role,
      department,
      first_name,
      last_name,
      is_staff,
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);

    if (error?.message?.includes("violates check constraint")) {
      // Handle constraint violation
      return res.status(400).json({ error: "Please enter valid data" });
    }

    res.status(500).json({
      error: error?.message
        ? error?.message
        : "Sorry! Couldn't process your request",
    });
  }
});

module.exports = router;
