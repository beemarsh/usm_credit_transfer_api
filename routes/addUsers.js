const express = require("express");
const userModel = require("../models/User");
const verifyToken = require("../utils/verifyToken");
const verifyIfUserAdmin = require("../utils/verifyAdmin");

const router = express.Router();

// Register route
router.post("/", verifyToken, verifyIfUserAdmin, async (req, res, next) => {
  try {
    const { email, password, role, department, first_name, last_name } =
      req.body;

    await userModel.createUser({
      email,
      password,
      is_admin: role,
      department,
      first_name,
      last_name,
      created_by: req.user.userId,
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
