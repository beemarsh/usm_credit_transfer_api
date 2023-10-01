function getDBErrMsg(error) {
  let err_msg = error?.msg;
  if (error?.message?.includes("student_student_id_key"))
    err_msg = "The student already exists";
  if (error?.message?.includes("JSON")) err_msg = "Please format your data";
  if (error?.message?.includes("student_major_fkey"))
    err_msg = "The provided major doesn't exist or is invalid.";
  if (error?.message?.includes("school_student_relation_school_code_fkey"))
    err_msg = "The provided school doesn't exist or is invalid.";
  if (error?.message?.includes("course_id"))
    err_msg = "The provided course doesn't exist or is invalid.";
  if (error?.message?.includes("users_department_fkey"))
    err_msg = "Please enter a valid department.";
  if (error?.message?.includes("users_email_key"))
    err_msg = "User already exists.";
  if (error?.message?.includes("unique_school_code"))
    err_msg = "School Already Exists";
  if (error?.message?.includes("unique_course_school"))
    err_msg = "The course_id is already associated with this school.";
  if (error?.message?.includes("fk_usm_eqv"))
    err_msg =
      "The selected USM equivalent USM course is invalid or doesn't exist.";
  if (error?.message?.includes("fk_school_code"))
    err_msg = "The provided school is invalid or doesn't exist.";
  if (error?.message?.includes("usm_departments_pkey"))
    err_msg = "The provided department already exists.";
  if (error?.message?.includes("usm_majors_department_fkey"))
    err_msg = "The provided department doesnt exist.";
  if (error?.message?.includes("usm_courses_associated_department_fkey"))
    err_msg = "The provided department doesnt exist.";
  if (error?.message?.includes("syntax"))
    err_msg = "The request you provided is invalid. Please provide correct data format.";

  return err_msg;
}

module.exports = getDBErrMsg;
