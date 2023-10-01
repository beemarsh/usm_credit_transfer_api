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

async function findDepartmentsWithFilter({ department_name, department_code }) {
  retrieved_data = await db.manyOrNone(`
    SELECT department_code,
    department_name
    FROM usm_departments
  WHERE
    (department_code IS NULL OR department_code LIKE '%${department_code}%')
    AND
    (department_name IS NULL OR department_name ILIKE '%${department_name}%');
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

async function findMajorsWithFilter({ major_code, major_name, department }) {
  retrieved_data = await db.manyOrNone(`
    SELECT major_code,
    major_name,
    department as department_code,
    (SELECT department_name from usm_departments where department_code = um.department) as department_name
    FROM usm_majors um
  WHERE
    (major_code IS NULL OR major_code LIKE '%${major_code}%')
    AND
    (major_name IS NULL OR major_name ILIKE '%${major_name}%')
    AND
    (department IS NULL OR department LIKE '%${department}%');
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

async function findUSMCoursesWithFilter({
  department,
  course_id,
  course_name,
}) {
  retrieved_data = await db.manyOrNone(`
    SELECT associated_department as department_code,
    course_id,
    course_name,
    course_hours,
    (SELECT department_name from usm_departments where department_code = uc.associated_department) as department_name
    FROM usm_courses uc
  WHERE
    (associated_department IS NULL OR associated_department LIKE '%${department}%')
    AND
    (course_id IS NULL OR course_id LIKE '%${course_id}%')
    AND
    (course_name IS NULL OR course_name ILIKE '%${course_name}%');
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
