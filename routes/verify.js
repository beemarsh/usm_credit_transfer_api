const express = require("express");
const verifyToken = require("../utils/verifyToken");
const { getUserData } = require("../models/User");

const router = express.Router();

router.post("/", verifyToken, async (req, res, next) => {
  try {
    user_data = getUserFormattedData(
      await getUserData({
        username: req.user.username,
        id: req.user.userId,
      })
    );

    res.json({ message: "Login Successful", user: user_data });
  } catch (error) {
    console.error("Error refreshing token:", error);
    next(error);
  }
});

const keysToCopy = [
  "username",
  "profile_picture",
  "role",
  "department",
  "first_name",
  "last_name",
  "is_staff",
  "is_admin",
];
const getUserFormattedData = (user) => {
  try {
    const formatted_user_data = Object.fromEntries(
      Object.entries(user).filter(([key]) => keysToCopy.includes(key))
    );

    return formatted_user_data;
  } catch (error) {
    throw { message: "Couldn't process your request", status: 401 };
  }
};

module.exports = router;
