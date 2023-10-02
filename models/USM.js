const db = require("../db-config");
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

async function findDepartmentsWithFilter({ q }) {
  retrieved_data = await db.manyOrNone(`
    SELECT department_code,
    department_name
    FROM usm_departments
  WHERE
    (department_code ILIKE '%${q}%')
    OR
    (department_name ILIKE '%${q}%');
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

async function findMajorsWithFilter({ q }) {
  retrieved_data = await db.manyOrNone(`
    SELECT major_code,
    major_name,
    department as department_code,
    (SELECT department_name from usm_departments where department_code = um.department) as department_name
    FROM usm_majors um
  WHERE
    (major_code ILIKE '%${q}%')
    OR
    (major_name ILIKE '%${q}%')
    OR
    (department ILIKE '%${q}%');
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

async function findUSMCoursesWithFilter({ q }) {
  retrieved_data = await db.manyOrNone(`
    SELECT associated_department as department_code,
    course_id,
    course_name,
    course_hours,
    (SELECT department_name from usm_departments where department_code = uc.associated_department) as department_name
    FROM usm_courses uc
  WHERE
    (associated_department ILIKE '%${q}%')
    OR
    (course_id ILIKE '%${q}%')
    OR
    (course_name ILIKE '%${q}%');
    `);

  return retrieved_data;
}

module.exports = {
  addDepartment,
  findDepartmentsWithFilter,
  addMajor,
  findMajorsWithFilter,
  addUSMCourse,
  findUSMCoursesWithFilter,
};
