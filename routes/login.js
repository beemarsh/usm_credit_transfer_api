const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/User");
const SECURE_COOKIES = process.env.COOKIE_SECURE == "true";
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN;
const COOKIE_SAME_SITE = process.env.COOKIE_SAME_SITE;
const COOKIE_HTTP_ONLY = process.env.COOKIE_HTTP_ONLY == "true";
const REFRESH_MAX_AGE = parseInt(process.env.REFRESH_MAX_AGE);
const ACCESS_MAX_AGE = parseInt(process.env.ACCESS_MAX_AGE);

const router = express.Router();

// Login route
router.post("/", async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await userModel.findByEmail({ email });

    if (!user) {
      throw { msg: "Please enter valid credentials", status: 401 };
    }

    if (!user?.is_active) {
      throw {
        msg: "Your account has been disabled! Please contact the administrator",
        status: 401,
      };
    }

    // Compare the provided password with the stored hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw { msg: "Please enter valid credentials", status: 401 };
    }

    // Generate a JWT token
    const accessToken = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.REFRESH_SECRET_KEY,
      { expiresIn: "7d" } // Refresh token expiration time
    );

    // Set tokens as HTTP-only cookies
    res.cookie("access_token", accessToken, {
      httpOnly: COOKIE_HTTP_ONLY,
      sameSite: COOKIE_SAME_SITE,
      secure: SECURE_COOKIES,
      domain: COOKIE_DOMAIN,
      maxAge: ACCESS_MAX_AGE, // 15 minutes
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: COOKIE_HTTP_ONLY,
      sameSite: COOKIE_SAME_SITE,
      secure: SECURE_COOKIES,
      domain: COOKIE_DOMAIN,
      maxAge: REFRESH_MAX_AGE, // 7 days
    });

    // Send the token in the HTTP response
    res.status(200).json({ message: "Login Successful" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
