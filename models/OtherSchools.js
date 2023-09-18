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

async function getOtherSchoolCourses(school_code) {
  if (!school_code)
    throw { message: "Couldn't find courses for the selected school" };

  const query = `SELECT jsonb_agg(DISTINCT
        jsonb_build_object(
            'course_id', course_id,
            'school', school,
            'name', name,
            'credit_hours', credit_hours,
            'usm_eqv', usm_eqv
        )
    ) AS result
    FROM other_school_courses
    WHERE school = '${school_code}';`;
  return await db.oneOrNone(query);
}

module.exports = { getInitialPropsToAddStudent, getOtherSchoolCourses };
