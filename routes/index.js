const express = require("express");
const registerRouter = require("./register");
const loginRouter = require("./login");
const verifyRouter = require("./verify");
const logoutRouter = require("./logout");
const getInitialAddProps = require("./getInitialAddProps");
const getOtherSchoolCourses = require("./getOtherSchoolCourses");
const addStudent = require("./addStudent");

const router = express.Router();

router.use("/register", registerRouter);
router.use("/login", loginRouter);
router.use("/verify", verifyRouter);
router.use("/logout", logoutRouter);
router.use("/add_initials", getInitialAddProps);
router.use("/school_courses", getOtherSchoolCourses);
router.use("/add_student", addStudent);

module.exports = router;
