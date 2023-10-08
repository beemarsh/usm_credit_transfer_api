const db = require("../db-config");
const { ROWS_PER_PAGE } = require("../utils/conf");
const {
  validateName,
  validateSchoolCode,
  validateCourseId,
  validateCourseName,
} = require("../utils/validation");

async function getInitialPropsToAddStudent() {
  const query = `SELECT
  jsonb_build_object(
      'majors', jsonb_agg(DISTINCT
          jsonb_build_object(
              'major_code', majors.major_code,
              'major_name', majors.major_name,
              'department', majors.department
          )
      ),
      'schools', jsonb_agg(DISTINCT 
          jsonb_build_object(
              'name', schools.name,
              'code', schools.code
          )
      )
  ) AS result
FROM
  usm_majors majors,
  verified_schools schools;`;
  return await db.oneOrNone(query);
}

async function getOtherSchoolCourses(schools) {
  const is_request_valid = schools?.every(
    (item) => item?.school_code !== "" && item?.school_code !== null
  );

  if (!is_request_valid) throw { msg: "Please provide a correct school name" };

  const schoolsString = schools
    .map(({ school_code }) => `'${school_code}'`)
    .join(",");

  const query = `SELECT
  vs.name AS school_name,
  vs.code AS school_code,
  CASE
    WHEN COUNT(o.course_id) = 0 THEN '[]'::jsonb
    ELSE jsonb_agg(
      jsonb_build_object(
        'course_id', o.course_id,
        'name', o.name,
        'usm_eqv', o.usm_eqv,
        'credit_hours', o.credit_hours
      )
    )
  END AS courses
FROM
  verified_schools vs
LEFT JOIN
  other_school_courses o
ON
  vs.code = o.school
WHERE
  vs.code IN (${schoolsString})
GROUP BY
  vs.name,
  vs.code;
`;
  return await db.manyOrNone(query);
}

async function addStudentToDB(student_data, img, uid) {
  const {
    first_name,
    last_name,
    id,
    country,
    phone_number,
    major,
    transfer_date,
    graduation_date,
    courses_taken,
  } = student_data;

  let school_array = [];
  courses_taken?.map(({ school_code }) => {
    school_array.push(school_code);
  });
  let schoolsString = school_array.map((code) => `'${code}'`).join(",");

  let last_query_partial_string = "";
  courses_taken.map(({ school_code, course_list }, i) => {
    let inner_course_array = [];
    course_list?.map(({ value }) => {
      inner_course_array.push(value);
    });
    let course_string = inner_course_array.map((str) => `'${str}'`).join(",");

    last_query_partial_string += `
    SELECT
          UNNEST(ARRAY[${course_string}]) AS course_id,
          '${school_code}' AS school
        ${i >= courses_taken?.length - 1 ? "" : "UNION ALL"}
    `;
  });

  const query = `-- Insert data into the student table and capture the generated student_id
  INSERT INTO student (student_id, country, phone, major, transfer_date, graduation_year, image, first_name, last_name, latest_updated_by, created_by)
  VALUES (
    '${id}',
    '${country}',
    '${phone_number}',
    '${major}',
    '${transfer_date}',
    '${graduation_date}',
    '${img ? img : "NULL"}',
    '${first_name}',
    '${last_name}',
    '${uid}',
    '${uid}'
  );
  
  -- Insert data into the school_student_relation table
  INSERT INTO school_student_relation (student_id, school_code)
  SELECT
    student_id,
    school_code
  FROM
    (SELECT
      '${id}' AS student_id,
      unnest(ARRAY[${schoolsString}]) AS school_code
    ) AS subquery;

    -- Insert data into the student_course_relation table
    INSERT INTO student_course_relation (student_id, course_id, school)
    SELECT
      '${id}' AS student_id,
      course_id,
      school
    FROM (
      ${last_query_partial_string}
    ) AS courses;
`;

  return await db.manyOrNone(query);
}

async function updateStudentCourseVerifiedStatus({
  student_id,
  course_id,
  school,
  status,
}) {
  return await db.query(`
  UPDATE student_course_relation SET is_verified=${!!status} WHERE student_id='${student_id}' AND course_id='${course_id}' AND school='${school}'
  `);
}

async function findStudentsWithFilter({ q, page = 1, verified = false }) {
  const seearch_criteria = `WHERE
  (
  (student_id ILIKE '%${q}%')
  OR
  (first_name ILIKE '%${q}%')
  OR
  (last_name ILIKE '%${q}%')
  )
  AND
  (all_courses_verified=${!!verified})
  `;

  const get_usm_eqv = `(SELECT usm_eqv from other_school_courses WHERE course_id=scr.course_id AND school=scr.school)`;

  retrieved_data = await db.oneOrNone(`
  WITH student_data AS
  (
  SELECT student_id,
  major,
  transfer_date,
  graduation_year,
  created_at,
  all_courses_verified as total_verified,
  CONCAT(first_name,' ',last_name) as name,
  latest_updated_date as last_updated,
  (SELECT CONCAT(u.first_name, ' ', u.last_name) FROM users u WHERE id = std.created_by) AS created_by,
  (SELECT CONCAT(u.first_name, ' ', u.last_name) FROM users u WHERE id = std.latest_updated_by) AS updated_by,
  (SELECT json_agg(json_build_object(
        'course_id', scr.course_id,
        'verified', scr.is_verified,
        'course_name', (SELECT name from other_school_courses WHERE course_id=scr.course_id AND school=scr.school),
        'school', scr.school,
        'school_name', (SELECT name from verified_schools WHERE code=scr.school),
        'usm_eqv', ${get_usm_eqv},
        'usm_eqv_course_name', (SELECT course_name FROM usm_courses WHERE course_id = ${get_usm_eqv})
    ))
    FROM student_course_relation scr
    WHERE scr.student_id = std.student_id
  ) AS courses_taken
  FROM student std
  ${seearch_criteria}
  LIMIT ${ROWS_PER_PAGE} OFFSET ${(page - 1) * ROWS_PER_PAGE}
  )
  SELECT COALESCE((SELECT json_agg(s.* )), '[]')  AS data, (SELECT CEIL(COUNT(*)) FROM student ${seearch_criteria}) AS total_rows FROM student_data AS s
  ;
  `);
  return retrieved_data;
}

async function markSelectedCourse({ student_id, status, courses }) {
  let arrayed_query = ``;
  courses?.map(({ course_id, school }, i) => {
    arrayed_query += `('${school}', '${course_id}', '${student_id}')${
      i < courses?.length - 1 ? `,` : ``
    }`;
  });

  await db.query(`
  UPDATE student_course_relation
SET is_verified = ${status}
WHERE (school, course_id, student_id) IN (
    ${arrayed_query}
);
  `);
}

async function markAllCourses({ student_id, status =true}) {
  await db.query(`
  UPDATE student_course_relation
SET is_verified=${status}
WHERE student_id='${student_id}';
UPDATE student
SET all_courses_verified = ${status}
WHERE student_id='${student_id}';
  `);
}

async function deleteMarkedCourses({ student_id, courses }) {
  let arrayed_query = ``;
  courses?.map(({ course_id, school }, i) => {
    arrayed_query += `('${school}', '${course_id}', '${student_id}')${
      i < courses?.length - 1 ? `,` : ``
    }`;
  });

  await db.query(`
  DELETE FROM student_course_relation
WHERE (school, course_id, student_id) IN (
    ${arrayed_query}
);
  `);
}

async function addSchool({ name, code, address }) {
  if (!validateName(name)) {
    throw { msg: "Invalid school name", status: 400 };
  }
  if (!validateSchoolCode(code)) {
    throw { msg: "Invalid school code", status: 400 };
  }

  return await db.query(
    "INSERT INTO verified_schools (name, code, address) VALUES ($1, $2, $3)",
    [name, code, address]
  );
}

async function updateSchool({ name, code, address, pre_code }) {
  if (!validateName(name)) {
    throw { msg: "Invalid school name", status: 400 };
  }
  if (!validateSchoolCode(code)) {
    throw { msg: "Invalid school code", status: 400 };
  }

  return await db.query(
    "UPDATE verified_schools SET name=$1, code=$2, address=$3 WHERE code=$4",
    [name, code, address, pre_code]
  );
}
async function deleteSchool({ code }) {
  if (!validateSchoolCode(code)) {
    throw { msg: "Invalid school code", status: 400 };
  }

  return await db.query("DELETE FROM verified_schools WHERE code=$1", [code]);
}

async function findSchoolsWithFilter({ q, page = 1 }) {
  const seearch_criteria = `WHERE
  (code ILIKE '%${q}%')
  OR
  (name ILIKE '%${q}%')`;
  retrieved_data = await db.oneOrNone(`
  WITH school_data AS
  (
  SELECT name,
  code,
  address
  FROM verified_schools
  ${seearch_criteria}
  LIMIT ${ROWS_PER_PAGE} OFFSET ${(page - 1) * ROWS_PER_PAGE}
  )
  SELECT COALESCE((SELECT json_agg(s.* )), '[]')  AS data, (SELECT CEIL(COUNT(*)) FROM verified_schools ${seearch_criteria}) AS total_rows FROM school_data AS s
  ;
  `);
  return retrieved_data;
}

async function addOtherSchoolCourses({
  course_id,
  school,
  name,
  usm_eqv,
  credit_hours,
}) {
  if (!validateCourseName(name)) {
    throw { msg: "Invalid Course Name", status: 400 };
  }
  if (!validateCourseId(course_id)) {
    throw { msg: "Invalid course ID", status: 400 };
  }

  return await db.query(
    "INSERT INTO other_school_courses (course_id, school, name, usm_eqv, credit_hours) VALUES ($1, $2, $3, $4, $5)",
    [course_id, school, name, usm_eqv, credit_hours]
  );
}

async function updateOtherSchoolCourses({
  course_id,
  school,
  name,
  usm_eqv,
  credit_hours,
  pre_course_id,
  pre_school,
}) {
  if (!validateCourseName(name)) {
    throw { msg: "Invalid Course Name", status: 400 };
  }
  if (!validateCourseId(course_id)) {
    throw { msg: "Invalid course ID", status: 400 };
  }

  return await db.query(
    "UPDATE other_school_courses set course_id=$1, school=$2, name=$3, usm_eqv=$4, credit_hours=$5 WHERE (course_id=$6 AND school=$7)",
    [course_id, school, name, usm_eqv, credit_hours, pre_course_id, pre_school]
  );
}
async function deleteOtherSchoolCourse({ course_id, school }) {
  if (!validateCourseId(course_id)) {
    throw { msg: "Invalid course ID", status: 400 };
  }

  return await db.query(
    "DELETE FROM other_school_courses WHERE (course_id=$1 AND school=$2)",
    [course_id, school]
  );
}

async function findOtherCoursesWithFilter({ q, page = 1 }) {
  const seearch_criteria = `
  WHERE
  (course_id ILIKE '%${q}%')
  OR
  (school ILIKE '%${q}%')
  OR
  (name ILIKE '%${q}%')
  OR
  (usm_eqv ILIKE '%${q}%')
  `;
  retrieved_data = await db.oneOrNone(`
  WITH course_data AS
  (
  SELECT
  course_id,
  school,
  name as course_name,
  school as school_code,
  usm_eqv,
  credit_hours,
  (SELECT name FROM verified_schools WHERE code = oc.school) AS school_name
  FROM other_school_courses oc
  ${seearch_criteria}
  LIMIT ${ROWS_PER_PAGE} OFFSET ${(page - 1) * ROWS_PER_PAGE}
  )
  SELECT COALESCE((SELECT json_agg(c.* )), '[]')  AS data, (SELECT CEIL(COUNT(*)) FROM other_school_courses ${seearch_criteria}) AS total_rows FROM course_data AS c
  ;
  `);

  return retrieved_data;
}

module.exports = {
  getInitialPropsToAddStudent,
  updateStudentCourseVerifiedStatus,
  markSelectedCourse,
  deleteMarkedCourses,
  markAllCourses,
  findStudentsWithFilter,
  getOtherSchoolCourses,
  addStudentToDB,
  addSchool,
  findSchoolsWithFilter,
  addOtherSchoolCourses,
  findOtherCoursesWithFilter,
  updateSchool,
  deleteSchool,
  updateOtherSchoolCourses,
  deleteOtherSchoolCourse,
};
