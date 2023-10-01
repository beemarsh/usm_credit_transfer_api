const usernameRegex = /^[a-zA-Z][a-zA-Z0-9]{5,}$/; // Alphanumeric, minimum six characters, starts with a letter
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Basic email validation regex

function validateUsername(username) {
  return usernameRegex.test(username);
}

function validateEmail(email) {
  return emailRegex.test(email);
}

function validateRole(role) {
  //1 is admin, 0 is organizer
  if (role === 1 || role === 0) return true;
  else return false;
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

function validateName(f_name) {
  const pattern = /^[A-Za-z\s]+$/;
  return pattern.test(f_name) && f_name?.length >= 2;
}

function validateSchoolCode(code) {
  const pattern = /^[A-Za-z]+$/;
  return pattern.test(code) && code?.length >= 3;
}

function validateCourseName(name) {
  const pattern = /^[\w\s]+$/;
  return pattern.test(name) && name?.length >= 2;
}

function validateCourseId(id) {
  const pattern = /^[A-Za-z0-9]+$/;
  return pattern.test(id) && id?.length >= 3;
}

function isUsmIDValid(id) {
  const pattern = /^\d{8}$/;
  return pattern.test(id);
}

function isValidPhoneNumber(phoneNumber) {
  // Define a regular expression pattern for a U.S. phone number
  const pattern = /^\d{10}$/; // Matches exactly 10 digits

  // Use the test() method to check if the phoneNumber matches the pattern
  return pattern.test(phoneNumber);
}

const { countries } = require("../utils/conf");
function isValidCountry(country_code) {
  const matchingCountry = countries.find(({ code }) => code === country_code);

  if (!matchingCountry) return false;
  else return true;
}

function isValidISODate(dateString) {
  // Attempt to parse the input string as a date
  const date = new Date(dateString);

  // Check if the parsed date is not 'Invalid Date'
  // and the input string matches the date string (to prevent partial matches)
  return (
    date.toString() !== "Invalid Date" && date.toISOString() === dateString
  );
}

function validateHours(hour) {
  let regex = /^[0-9]+$/;
  if (!regex.test(hour)) return false;
  return true;
}

module.exports = {
  validateEmail,
  validateUsername,
  validatePassword,
  validateName,
  isUsmIDValid,
  isValidPhoneNumber,
  isValidCountry,
  isValidISODate,
  validateRole,
  validateSchoolCode,
  validateCourseId,
  validateCourseName,
  validateHours,
};
