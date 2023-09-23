const db = require("../db-config");

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

module.exports = {
  getInitialPropsToAddStudent,
  getOtherSchoolCourses,
  addStudentToDB,
};
