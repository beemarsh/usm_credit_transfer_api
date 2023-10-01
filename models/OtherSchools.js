const db = require("../db-config");
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
              'major_description', majors.major_description,
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

  if (!is_request_valid)
    throw { message: "Please provide a correct school name" };

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
async function findSchoolsWithFilter({ name, code }) {
  retrieved_data = await db.manyOrNone(`
  SELECT name,
  code,
  address
  FROM verified_schools
WHERE
  (code IS NULL OR code LIKE '%${code}%')
  AND
  (name IS NULL OR name ILIKE '%${name}%');
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
async function findOtherCoursesWithFilter({
  course_id,
  school,
  name,
  usm_eqv,
}) {
  retrieved_data = await db.manyOrNone(`
  SELECT
  course_id,
  school,
  name as course_name,
  school as school_code,
  usm_eqv,
  credit_hours,
  (SELECT name FROM verified_schools WHERE code = oc.school) AS school_name
  FROM other_school_courses oc
WHERE
  (course_id IS NULL OR course_id LIKE '%${course_id}%')
  AND
  (school IS NULL OR school LIKE '%${school}%')
  AND
  (name IS NULL OR name LIKE '%${name}%')
  AND
  (usm_eqv IS NULL OR usm_eqv LIKE '%${usm_eqv}%');
  `);

  return retrieved_data;
}

module.exports = {
  getInitialPropsToAddStudent,
  getOtherSchoolCourses,
  addStudentToDB,
  addSchool,
  findSchoolsWithFilter,
  addOtherSchoolCourses,
  findOtherCoursesWithFilter,
};
