const db = require("../db-config");
const bcrypt = require("bcrypt");

const {
  validateEmail,
  validateUsername,
  validateDepartment,
  validateName,
  validatePassword,
  validateRole,
} = require("../utils/validation");

async function createUser({
  username,
  email,
  password,
  profile_picture,
  role,
  department,
  first_name,
  last_name,
  is_staff = false,
}) {
  if (!validateUsername(username)) {
    throw { message: "Invalid username" };
  }

  if (!validateEmail(email)) {
    throw { message: "Invalid email address" };
  }

  if (!validatePassword(password)) {
    throw {
      message:
        "Password should be at least six characters and have at least one number",
    };
  }
  if (!validateRole(role)) {
    throw { message: "Unrecognized role selected" };
  }

  if (!validateDepartment(department)) {
    throw { message: "Unrecognized department selected" };
  }

  if (!validateName(first_name)) {
    throw { message: "Please enter a valid first name" };
  }

  if (!validateName(last_name)) {
    throw { message: "Please enter a valid last name" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  return db.one(
    "INSERT INTO users (username, email, password, profile_picture, role, department, first_name, last_name, is_staff) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
    [
      username,
      email,
      hashedPassword,
      profile_picture,
      role,
      department,
      first_name,
      last_name,
      is_staff,
    ]
  );
}

async function findByEmail({ email }) {
  if (!validateEmail(email)) {
    throw { message: "Invalid email address" };
  }

  return await db.oneOrNone("SELECT * FROM users WHERE email = $1", email);
}

async function findByUsername({ username }) {
  if (!validateUsername(username)) {
    throw { message: "Invalid username" };
  }

  return await db.oneOrNone(
    "SELECT * FROM users WHERE username = $1",
    username
  );
}

async function findByUsernameOrEmail({ username, email }) {
  if (!validateUsername(username) || !validateEmail(email)) {
    throw { error: "Please enter valid credentials" };
  }
  return await db.oneOrNone(
    "SELECT * FROM users WHERE username = $1 OR email = $2",
    [username, email]
  );
}

async function getUserData({ username, id }) {
  if (!validateUsername(username)) {
    throw { error: "Please enter valid credentials" };
  }

  retrieved_data = await db.oneOrNone(
    "SELECT * FROM users WHERE username = $1 AND id = $2",
    [username, id]
  );

  return retrieved_data;
}

module.exports = {
  createUser,
  findByUsername,
  findByEmail,
  findByUsernameOrEmail,
  getUserData,
};
