const db = require("../db-config");
const bcrypt = require("bcrypt");

const {
  validateEmail,
  validateName,
  validatePassword,
  validateRole,
} = require("../utils/validation");

async function createUser({
  email,
  password,
  is_admin,
  department,
  first_name,
  last_name,
  created_by,
}) {
  if (!validateEmail(email)) {
    throw { msg: "Invalid email address", status: 400 };
  }

  if (!validatePassword(password)) {
    throw {
      msg: "Password should be at least six characters and have at least one number",
      status: 400,
    };
  }

  if (!validateRole(is_admin)) {
    throw { msg: "Unrecognized role selected", status: 400 };
  }

  if (!validateName(first_name)) {
    throw { msg: "Please enter a valid first name", status: 400 };
  }

  if (!validateName(last_name)) {
    throw { msg: "Please enter a valid last name", status: 400 };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  return await db.query(
    "INSERT INTO users (first_name, last_name, email, password, is_admin, department, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7)",
    [
      first_name,
      last_name,
      email,
      hashedPassword,
      !!is_admin,
      department,
      created_by,
    ]
  );
}

async function findByEmail({ email }) {
  if (!validateEmail(email)) {
    throw { msg: "Invalid email address", status: 400 };
  }

  return await db.oneOrNone("SELECT * FROM users WHERE email = $1", email);
}
async function findByID({ id }) {
  return await db.oneOrNone("SELECT * FROM users WHERE id = $1", id);
}

async function getUserData({ id }) {
  retrieved_data = await db.oneOrNone("SELECT * FROM users WHERE id = $1", [
    id,
  ]);

  return retrieved_data;
}

async function findUsersWithFilter({ email, name, department }) {
  retrieved_data = await db.manyOrNone(`
  SELECT first_name,
  last_name,
  email,
  department,
  CASE WHEN u.is_admin THEN 1 ELSE 0 END AS role,
  (SELECT CONCAT(first_name, ' ', last_name) FROM users WHERE id = u.created_by) AS created_by
  FROM users u
WHERE
  (department IS NULL OR department LIKE '%${department}%')
  AND
  (email IS NULL OR email ILIKE '%${email}%')
  AND
  (
    '' IS NULL
    OR
    (first_name || ' ' || last_name) ILIKE '%${name}%'
  );
  `);

  return retrieved_data;
}

module.exports = {
  createUser,
  findByEmail,
  getUserData,
  findByID,
  findUsersWithFilter,
};
