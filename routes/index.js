const express = require("express");
const addUsers = require("./addUsers");
const loginRouter = require("./login");
const verifyRouter = require("./verify");
const logoutRouter = require("./logout");
const getInitialAddProps = require("./getInitialAddProps");
const getOtherSchoolCourses = require("./getOtherSchoolCourses");
const addStudent = require("./addStudent");
const deleteStudent = require("./deleteStudent");
const getStudents = require("./getStudents");
const getStudentAllCourses = require("./getStudentAllCourses");
const markCourse = require("./markCourse");
const markAllCourses = require("./markAllCourses");
const updateStudentCourseStatus = require("./updateStudentCourseStatus");
const deleteMarkedCourse = require("./deleteMarkedCourse");
const getUsers = require("./getUsers");
const updateUser = require("./updateUser");
const userDelete = require("./userDelete");
const userActiveStatusUpdate = require("./userActiveStatusUpdate");
const addSchool = require("./addSchool");
const getSchools = require("./getSchools");
const updateSchool = require("./updateSchool");
const deleteSchool = require("./schoolDelete");
const addOtherCourse = require("./addOtherCourse");
const getOtherCourses = require("./getOtherCourses");
const updateOtherSchoolCourse = require("./updateOtherSchoolCourse");
const deleteOtherSchoolCourse = require("./deleteOtherSchoolCourse");
const addDepartment = require("./addDepartment");
const getDepartments = require("./getDepartments");
const updateDepartment = require("./updateDepartment");
const deleteDepartment = require("./deleteDepartment");
const addMajor = require("./addMajor");
const deleteMajor = require("./deleteMajor");
const updateMajor = require("./updateMajor");
const getMajors = require("./getMajors");
const addUSMCourse = require("./addUSMCourse");
const getUSMCourses = require("./getUSMCourses");
const updateUSMCourse = require("./updateUSMCourse");
const deleteUSMCourse = require("./deleteUSMCourse");

const router = express.Router();

router.use("/login", loginRouter);
router.use("/verify", verifyRouter);
router.use("/logout", logoutRouter);
router.use("/add_initials", getInitialAddProps);
router.use("/school_courses", getOtherSchoolCourses);
router.use("/mark_selected_course", markCourse);
router.use("/mark_all_course", markAllCourses);
router.use("/delete_marked_course", deleteMarkedCourse);
router.use("/add_student", addStudent);
router.use("/delete_student", deleteStudent);
router.use("/update_student_course_status", updateStudentCourseStatus);
router.use("/get_students", getStudents);
router.use("/get_student_all_courses", getStudentAllCourses);
router.use("/get_users", getUsers);
router.use("/add_user", addUsers);
router.use("/update_user", updateUser);
router.use("/delete_user", userDelete);
router.use("/update_user_status", userActiveStatusUpdate);
router.use("/add_school", addSchool);
router.use("/get_schools", getSchools);
router.use("/update_school", updateSchool);
router.use("/delete_school", deleteSchool);
router.use("/add_other_course", addOtherCourse);
router.use("/get_other_courses", getOtherCourses);
router.use("/update_other_course", updateOtherSchoolCourse);
router.use("/delete_other_course", deleteOtherSchoolCourse);
router.use("/add_department", addDepartment);
router.use("/get_departments", getDepartments);
router.use("/update_department", updateDepartment);
router.use("/delete_department", deleteDepartment);
router.use("/add_major", addMajor);
router.use("/update_major", updateMajor);
router.use("/delete_major", deleteMajor);
router.use("/get_majors", getMajors);
router.use("/add_usm_course", addUSMCourse);
router.use("/get_usm_courses", getUSMCourses);
router.use("/update_usm_course", updateUSMCourse);
router.use("/delete_usm_course", deleteUSMCourse);

module.exports = router;
