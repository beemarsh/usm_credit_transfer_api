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

  return err_msg;
}

module.exports = getDBErrMsg;
