const db = require("../db-config");
const { ROWS_PER_PAGE } = require("../utils/conf");
const {
  validateCourseId,
  validateCourseName,
  validateHours,
} = require("../utils/validation");

async function addDepartment({ department_code, department_name }) {
  if (!validateCourseName(department_name)) {
    throw { msg: "Invalid department name", status: 400 };
  }
  if (!validateCourseId(department_code)) {
    throw { msg: "Invalid department code", status: 400 };
  }

  return await db.query(
    "INSERT INTO usm_departments (department_code, department_name) VALUES ($1, $2)",
    [department_code, department_name]
  );
}
async function updateDepartment({
  department_code,
  department_name,
  pre_department_code,
}) {
  if (!validateCourseName(department_name)) {
    throw { msg: "Invalid department name", status: 400 };
  }
  if (!validateCourseId(department_code)) {
    throw { msg: "Invalid department code", status: 400 };
  }

  return await db.query(
    "UPDATE usm_departments SET department_code=$1, department_name=$2 WHERE department_code=$3",
    [department_code, department_name, pre_department_code]
  );
}
async function deleteDepartment({ department_code }) {
  if (!validateCourseId(department_code)) {
    throw { msg: "Invalid department code", status: 400 };
  }

  return await db.query(
    "DELETE FROM usm_departments WHERE department_code=$1",
    [department_code]
  );
}

async function findDepartmentsWithFilter({ q = "", page = 1, all = false }) {
  const searchQuery = `
  WHERE
    (department_code ILIKE '%${q}%')
    OR
    (department_name ILIKE '%${q}%')
  `;
  retrieved_data = await db.oneOrNone(`
  WITH department_data AS
  (
    SELECT department_code,
    department_name
    FROM usm_departments
    ${searchQuery}
    ${all ? "" : `LIMIT ${ROWS_PER_PAGE} OFFSET ${(page - 1) * ROWS_PER_PAGE}`}
    )
    SELECT COALESCE((SELECT json_agg(d.* )), '[]')  AS data, (SELECT CEIL(COUNT(*)) FROM usm_departments ${searchQuery}) AS total_rows FROM department_data AS d
    ;
    `);

  return retrieved_data;
}

async function addMajor({ major_code, major_name, department }) {
  if (!validateCourseName(major_name)) {
    throw { msg: "Invalid major name", status: 400 };
  }
  if (!validateCourseId(major_code)) {
    throw { msg: "Invalid major code", status: 400 };
  }
  if (!validateCourseId(department)) {
    throw { msg: "Invalid department code", status: 400 };
  }

  return await db.query(
    "INSERT INTO usm_majors (major_code, major_name, department) VALUES ($1, $2, $3)",
    [major_code, major_name, department]
  );
}
async function updateMajor({
  major_code,
  major_name,
  department,
  pre_major_code,
}) {
  if (!validateCourseName(major_name)) {
    throw { msg: "Invalid major name", status: 400 };
  }
  if (!validateCourseId(major_code)) {
    throw { msg: "Invalid major code", status: 400 };
  }
  if (!validateCourseId(department)) {
    throw { msg: "Invalid department code", status: 400 };
  }

  return await db.query(
    "UPDATE usm_majors SET major_code=$1, major_name=$2, department=$3 WHERE major_code=$4",
    [major_code, major_name, department, pre_major_code]
  );
}
async function deleteMajor({ major_code }) {
  if (!validateCourseId(major_code)) {
    throw { msg: "Invalid major code", status: 400 };
  }
  return await db.query("DELETE FROM usm_majors WHERE major_code=$1", [
    major_code,
  ]);
}

async function findMajorsWithFilter({ q = "", page = 1 }) {
  const searchQuery = `
  WHERE
    (major_code ILIKE '%${q}%')
    OR
    (major_name ILIKE '%${q}%')
    OR
    (department ILIKE '%${q}%')
  `;
  retrieved_data = await db.oneOrNone(`
  WITH major_data AS
  (
    SELECT major_code,
    major_name,
    department as department_code,
    (SELECT department_name from usm_departments where department_code = um.department) as department_name
    FROM usm_majors um
    ${searchQuery}
    LIMIT ${ROWS_PER_PAGE} OFFSET ${(page - 1) * ROWS_PER_PAGE}
    )
    SELECT COALESCE((SELECT json_agg(d.* )), '[]')  AS data, (SELECT CEIL(COUNT(*)) FROM usm_majors ${searchQuery}) AS total_rows FROM major_data AS d
    ;
    `);

  return retrieved_data;
}

async function addUSMCourse({
  department,
  course_id,
  course_name,
  course_hours,
}) {
  if (!validateCourseName(course_name)) {
    throw { msg: "Please enter a valid course name", status: 400 };
  }
  if (!validateCourseId(department)) {
    throw { msg: "Invalid department selected", status: 400 };
  }
  if (!validateCourseId(course_id)) {
    throw { msg: "Please enter a valid course ID", status: 400 };
  }
  if (!validateHours(course_hours)) {
    throw { msg: "Please enter valid course hours", status: 400 };
  }

  return await db.query(
    "INSERT INTO usm_courses (associated_department, course_id, course_name, course_hours) VALUES ($1, $2, $3, $4)",
    [department, course_id, course_name, course_hours]
  );
}
async function updateUSMCourse({
  department,
  course_id,
  course_name,
  course_hours,
  pre_course_id,
}) {
  if (!validateCourseName(course_name)) {
    throw { msg: "Please enter a valid course name", status: 400 };
  }
  if (!validateCourseId(department)) {
    throw { msg: "Invalid department selected", status: 400 };
  }
  if (!validateCourseId(course_id)) {
    throw { msg: "Please enter a valid course ID", status: 400 };
  }
  if (!validateHours(course_hours)) {
    throw { msg: "Please enter valid course hours", status: 400 };
  }

  return await db.query(
    "UPDATE usm_courses SET associated_department=$1, course_id=$2, course_name=$3, course_hours=$4 WHERE course_id=$5",
    [department, course_id, course_name, course_hours, pre_course_id]
  );
}
async function deleteUSMCourse({ course_id }) {
  if (!validateCourseId(course_id)) {
    throw { msg: "Please enter a valid course ID", status: 400 };
  }
  return await db.query("DELETE FROM usm_courses WHERE course_id=$1", [
    course_id,
  ]);
}

async function findUSMCoursesWithFilter({ q = "", all = false, page = 1 }) {
  if (all) {
    return await db.manyOrNone(`
    SELECT * FROM usm_courses
    `);
  }
  const searchQuery = `
  WHERE
    (associated_department ILIKE '%${q}%')
    OR
    (course_id ILIKE '%${q}%')
    OR
    (course_name ILIKE '%${q}%')
  `;

  retrieved_data = await db.oneOrNone(`
  WITH course_data AS
  (
    SELECT associated_department as department_code,
    course_id,
    course_name,
    course_hours,
    (SELECT department_name from usm_departments where department_code = uc.associated_department) as department_name
    FROM usm_courses uc
    ${searchQuery}
    LIMIT ${ROWS_PER_PAGE} OFFSET ${(page - 1) * ROWS_PER_PAGE}
    )
    SELECT COALESCE((SELECT json_agg(c.* )), '[]')  AS data, (SELECT CEIL(COUNT(*)) FROM usm_courses ${searchQuery}) AS total_rows FROM course_data AS c
    ;
    `);

  return retrieved_data;
}

module.exports = {
  addDepartment,
  findDepartmentsWithFilter,
  updateDepartment,
  deleteDepartment,
  addMajor,
  findMajorsWithFilter,
  updateMajor,
  deleteMajor,
  addUSMCourse,
  updateUSMCourse,
  deleteUSMCourse,
  findUSMCoursesWithFilter,
};
