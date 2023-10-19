const express = require("express");
const verifyToken = require("../utils/verifyToken");
const { getUserData } = require("../models/User");

const router = express.Router();

router.post("/", verifyToken, async (req, res, next) => {
  try {
    let unformatted_user_data = await getUserData({
      id: req?.user?.userId,
    });

    if (!unformatted_user_data?.is_active) {
      throw {
        msg: "Your account has been disabled! Please contact the administrator",
        status: 401,
      };
    }

    let formatted_user_data = getUserFormattedData(unformatted_user_data);

    res.json({ message: "Login Successful", user: formatted_user_data });
  } catch (error) {
    console.error("Error refreshing token:", error);
    next(error);
  }
});

const keysToCopy = ["is_admin", "department", "first_name", "last_name"];
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
