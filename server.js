const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const https = require("https");
const fs = require("fs");
const http = require("http");

dotenv.config(); // Load environment variables from .env file
const SECRET_KEY = process.env.SECRET_KEY;

const app = express();
const port = process.env.PORT;

app.enable("trust proxy");
// Middleware
app.use(cookieParser());

app.use(
  session({
    secret: SECRET_KEY,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(bodyParser.json());

const corsOptions = {
  origin: [
    "https://localhost:3000",
    "https://127.0.0.1:3000",
    "https://app.localhost.com:3000",
    "http://app.localhost.com:3000",
  ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Enable credentials (e.g., cookies, authentication headers)
  preflightContinue: true,
  credentials: true,
};
app.use(cors(corsOptions));

// Routes
const apiRoutes = require("./routes/index");
const getDBErrMsg = require("./models/dbError");
app.use("/", apiRoutes);

// Middleware to handle errors
app.use((error, req, res, next) => {
  if (error?.message?.includes("violates check constraint")) {
    // Handle constraint violation
    return res
      .status(error?.status ? error?.status : 400)
      .json({ message: "Please enter valid data" });
  } else if (error instanceof SyntaxError && "body" in error) {
    res
      .status(error?.status ? error.status : 400)
      .json({ message: "Please format your data" });
  } else {
    const db_err = getDBErrMsg(error);
    console.log(db_err);
    res.status(error?.status ? error?.status : 400).json({
      message: db_err ? db_err : "Sorry! Couldn't process your request",
    });
  }
  console.log(error);
});

// Catch-all route handler for undefined routes
app.use((req, res, next) => {
  console.log("Requested URL not found:", req.url);
  res.status(404).json({ message: "The requested URL doesn't exist" });
});

const httpServer = http.createServer(app);

httpServer.listen(port, () => {
  console.log(
    `Express server is running on HTTP at http://api.localhost.com:${port}`
  );
});

// const options = {
//   key: fs.readFileSync(__dirname + "/api.localhost.com-key.pem"), // Path to your private key
//   cert: fs.readFileSync(__dirname + "/api.localhost.com.pem"), // Path to your certificate
// };
// const httpsServer = https.createServer(options, app);
// httpsServer.listen(port, () => {
//   console.log(
//     `Express server is running on HTTPS at https://api.localhost.com:${port}`
//   );
// });
