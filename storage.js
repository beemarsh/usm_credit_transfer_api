const AWS = require("aws-sdk");

// Set your AWS access and secret keys here
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_S3_REGION, // e.g., 'us-east-1'
});

const s3 = new AWS.S3();

module.exports = s3;
