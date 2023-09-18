const usernameRegex = /^[a-zA-Z][a-zA-Z0-9]{5,}$/; // Alphanumeric, minimum six characters, starts with a letter
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Basic email validation regex

function validateUsername(username) {
  return usernameRegex.test(username);
}

function validateEmail(email) {
  return emailRegex.test(email);
}

function validatePassword(password) {
  // Check if the password is at least 6 characters long
  if (password.length < 6) {
    return false;
  }

  // Use regular expressions to check for at least one letter and one number
  const letterPattern = /[a-zA-Z]/;
  const numberPattern = /[0-9]/;

  return letterPattern.test(password) && numberPattern.test(password);
}

function validateRole(role) {
  const allowedRoles = ["ADV", "STD", "ADM"];
  return allowedRoles.includes(role);
}

function validateDepartment(department) {
  const allowedDepartments = ["SOC", "DOP"];
  return allowedDepartments.includes(department);
}

function validateName(name) {
  return name.length >= 2;
}

module.exports = {
  validateEmail,
  validateUsername,
  validatePassword,
  validateRole,
  validateDepartment,
  validateName,
};
