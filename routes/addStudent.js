const express = require("express");
const verifyToken = require("../utils/verifyToken");
const s3 = require("../storage");
const router = express.Router();

// Set up multer to handle file uploads
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const { addStudentToDB } = require("../models/OtherSchools");
const getDBErrMsg = require("../models/dbError");

router.post(
  "/",
  verifyToken,
  upload.fields([
    { name: "pp", maxCount: 1 }, // for file upload
    { name: "student_data", maxCount: 1 }, // for JSON data
  ]),
  async (req, res, next) => {
    try {
      const uploadedFile = req.files["pp"] ? req.files["pp"][0] : null;
      const studentData = JSON.parse(req.body?.["student_data"]); // Parse JSON data

      let s3Url = "";
      if (uploadedFile) {
        // Specify the S3 bucket name
        const fileExtension = uploadedFile.originalname.split(".").pop();
        const bucketName = process.env.AWS_S3_BUCKET;
        const fileName = `student_pic/${req.user.userId}.${fileExtension}`;

        const params = {
          Bucket: bucketName,
          Key: fileName,
          Body: uploadedFile.buffer, // Use the file buffer from req.file
        };
        s3Url = await uploadToS3(params);
      }

      //  Now that file handling is completed, lets validate whether that is true or not
      // This is the format of student data
      //   first_name: "",
      //   last_name: "",
      //   id: "",
      //   country: "",
      //   phone_number: "",
      //   major: "",
      //   transfer_date: "",
      //   graduation_date: "",
      //   courses_taken: [
      //                    {
      //                      school_code:"",
      //                      course_list:[
      //                          {value:""},
      //                          ...
      //                        ],
      //                    },
      //                    ...
      //                ],
      validateAddStudentRequest(studentData);

      await addStudentToDB(studentData, s3Url, req.user.userId);

      // Send a response to the client after successful upload
      res.status(200).json({ message: "Success" });
    } catch (error) {
      next(error);
    }
  }
);

const {
  validateName,
  isUsmIDValid,
  isValidCountry,
  isValidISODate,
  isValidPhoneNumber,
} = require("../utils/validation");

function validateAddStudentRequest(data) {
  // Check if first_name is valid
  if (!validateName(data?.first_name)) {
    throw { msg: "Invalid first name" };
  }

  // Check if last_name is valid
  if (!validateName(data?.last_name)) {
    throw { msg: "Invalid last name" };
  }

  // Check if usmid is valid
  if (!isUsmIDValid(data?.id)) {
    throw { msg: "Invalid USM ID" };
  }

  if (!isValidCountry(data?.country)) {
    throw { msg: "Invalid country code" };
  }

  // Check if phone_number is valid
  if (!isValidPhoneNumber(data?.phone_number)) {
    throw { msg: "Invalid phone number" };
  }

  if (
    !isValidISODate(data?.transfer_date) ||
    !isValidISODate(data?.graduation_date)
  ) {
    throw { msg: "Invalid date format" };
  }

  //We also need to check major, schools and courses; However, they are foreign keys so they neednot be checked because they will be automatically detected if the FK doesnt exist
  // If all checks pass, the data is valid
  return true;
}

// Wrap the S3 upload operation in a Promise for better control
const uploadToS3 = (params) =>
  new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if (err) {
        console.error("Error uploading file to S3:", err);
        reject(err);
      } else {
        resolve(data.Location);
      }
    });
  });

module.exports = router;
