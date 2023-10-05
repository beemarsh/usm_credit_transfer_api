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

async function updateUser({ email, role, department, first_name, last_name }) {
  if (!validateEmail(email)) {
    throw { msg: "Invalid email address", status: 400 };
  }

  if (!validateRole(role)) {
    throw { msg: "Unrecognized role selected", status: 400 };
  }

  if (!validateName(first_name)) {
    throw { msg: "Please enter a valid first name", status: 400 };
  }

  if (!validateName(last_name)) {
    throw { msg: "Please enter a valid last name", status: 400 };
  }

  return await db.query(
    "UPDATE users set first_name=$1, last_name=$2, is_admin=$3, department=$4 WHERE email=$5",
    [first_name, last_name, !!role, department, email]
  );
}

async function changeUserActive({ email }) {
  if (!validateEmail(email)) {
    throw { msg: "Invalid email address", status: 400 };
  }

  return await db.query(
    "UPDATE users set is_active= CASE WHEN is_active=true THEN false ELSE true END WHERE email=$1",
    [email]
  );
}
async function deleteUser({ email }) {
  if (!validateEmail(email)) {
    throw { msg: "Invalid email address", status: 400 };
  }
  return await db.query("DELETE from users WHERE email=$1", [email]);
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

async function findUsersWithFilter({ q, page }) {
  const per_page = 2;
  const searchQuery = `
  WHERE
  (
    (department LIKE '%${q}%')
    OR
    (email ILIKE '%${q}%')
    OR
    (
      (first_name || ' ' || last_name) ILIKE '%${q}%'
    )
    )
    AND
    is_super = false
    `;
  retrieved_data = await db.oneOrNone(`
  WITH user_data AS
  (
  SELECT first_name,
    last_name,
    email,
    department,
    is_active,
    CASE WHEN u.is_admin THEN 1 ELSE 0 END AS role,
    (SELECT CONCAT(first_name, ' ', last_name) FROM users WHERE id = u.created_by) AS created_by,
    (SELECT department_name FROM usm_departments WHERE department_code = u.department) AS department_name
    FROM users u
  ${searchQuery}
  LIMIT ${per_page} OFFSET ${(page - 1) * per_page}
  )
  SELECT COALESCE((SELECT json_agg(u.* )), '[]')  AS data, CEIL(CEIL(COUNT(*) / ${per_page}) + CEIL(COUNT(*) % ${per_page})) AS total, (SELECT CEIL(COUNT(*)) FROM users ${searchQuery}) AS total_rows FROM user_data AS u
  
  ;
  `);

  return retrieved_data;
}

module.exports = {
  createUser,
  findByEmail,
  getUserData,
  findByID,
  findUsersWithFilter,
  updateUser,
  changeUserActive,
  deleteUser,
};
