const db = require("../db-config");

async function isValidDepartment(departmentCode) {
  const query = `
      SELECT * 
      FROM usm_departments 
      WHERE department_code = '${departmentCode}';
    `;

  const result = await db.oneOrNone(query);

  return result !== null; // Returns true if the department exists, false if it doesn't
}

async function isValidMajor(majorCode) {
  const query = `
      SELECT * 
      FROM usm_majors 
      WHERE major_code = '${majorCode}';
    `;

  const result = await db.oneOrNone(query);

  return result !== null; // Returns true if the department exists, false if it doesn't
}

async function isSchoolValid(schoolCode) {
  const query = `
      SELECT * 
      FROM verified_schools 
      WHERE code = '${schoolCode}';
    `;

  const result = await db.oneOrNone(query);

  return result !== null; // Returns true if the department exists, false if it doesn't
}

module.exports = { isValidDepartment, isValidMajor, isSchoolValid };
