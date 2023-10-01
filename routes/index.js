const express = require("express");
const addUsers = require("./addUsers");
const loginRouter = require("./login");
const verifyRouter = require("./verify");
const logoutRouter = require("./logout");
const getInitialAddProps = require("./getInitialAddProps");
const getOtherSchoolCourses = require("./getOtherSchoolCourses");
const addStudent = require("./addStudent");
const getUsers = require("./getUsers");
const addSchool = require("./addSchool");
const getSchools = require("./getSchools");
const addOtherCourse = require("./addOtherCourse");
const getOtherCourses = require("./getOtherCourses");

const router = express.Router();

router.use("/login", loginRouter);
router.use("/verify", verifyRouter);
router.use("/logout", logoutRouter);
router.use("/add_initials", getInitialAddProps);
router.use("/school_courses", getOtherSchoolCourses);
router.use("/add_student", addStudent);
router.use("/get_users", getUsers);
router.use("/add_user", addUsers);
router.use("/add_school", addSchool);
router.use("/get_schools", getSchools);
router.use("/add_other_course", addOtherCourse);
router.use("/get_other_courses", getOtherCourses);

module.exports = router;
