const express = require("express");
const verifyToken = require("../utils/verifyToken");

const SECURE_COOKIES = process.env.COOKIE_SECURE == "true";
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN;
const COOKIE_SAME_SITE = process.env.COOKIE_SAME_SITE;
const COOKIE_HTTP_ONLY = process.env.COOKIE_HTTP_ONLY == "true";

const router = express.Router();

// Logout route
router.post("/", verifyToken, async (req, res, next) => {
  try {
    res.clearCookie("refresh_token", {
      domain: COOKIE_DOMAIN,
      sameSite: COOKIE_SAME_SITE,
      secure: SECURE_COOKIES,
      httpOnly: COOKIE_HTTP_ONLY,
    });
    res.clearCookie("access_token", {
      domain: COOKIE_DOMAIN,
      sameSite: COOKIE_SAME_SITE,
      secure: SECURE_COOKIES,
      httpOnly: COOKIE_HTTP_ONLY,
    });

    res.status(200).json({ message: "Logout Successful" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
