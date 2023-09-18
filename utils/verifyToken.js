const jwt = require("jsonwebtoken");

const SECURE_COOKIES = process.env.COOKIE_SECURE == "true";
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN;
const COOKIE_SAME_SITE = process.env.COOKIE_SAME_SITE;
const COOKIE_HTTP_ONLY = process.env.COOKIE_HTTP_ONLY == "true";
const ACCESS_MAX_AGE = parseInt(process.env.ACCESS_MAX_AGE);

// Function to generate a new access token
const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user.id, role: user.role },
    process.env.SECRET_KEY,
    {
      expiresIn: "1h", // Set the new access token expiration time as needed
    }
  );
};

const verifyAccessTokenAndRefresh = (req, res, next) => {
  // Get the access token and refresh token from cookies
  const accessToken = req.cookies.access_token;
  const refreshToken = req.cookies.refresh_token;

  try {
    // Check if the access token exists
    if (!accessToken) {
      throw {
        message: "Access token is missing",
        status: 401,
        name: "AcessTokenMissing",
      };
    }

    // Verify and decode the access token
    const decoded = jwt.verify(accessToken, process.env.SECRET_KEY);

    // Attach the user data to the request object for future use
    req.user = decoded;

    // Continue with the next middleware or route handler
    next();
  } catch (error) {
    // If the access token is invalid or has expired
    if (
      error.name === "TokenExpiredError" ||
      error.name === "AcessTokenMissing"
    ) {
      // Check if the refresh token exists
      if (!refreshToken) {
        throw { message: "Refresh token is missing", status: 401 };
      }

      try {
        // Verify and decode the refresh token
        const decodedRefresh = jwt.verify(
          refreshToken,
          process.env.REFRESH_SECRET_KEY // Use a different secret key for refresh tokens
        );

        // Generate a new access token and attach the user data
        const newAccessToken = generateAccessToken(decodedRefresh);
        req.user = decodedRefresh;

        // Set the new access token in the response cookie
        res.cookie("access_token", newAccessToken, {
          maxAge: ACCESS_MAX_AGE, // Set the new access token expiration time as needed
          httpOnly: COOKIE_HTTP_ONLY,
          secure: SECURE_COOKIES,
          domain: COOKIE_DOMAIN,
          sameSite: COOKIE_SAME_SITE,
        });

        // Continue with the next middleware or route handler
        next();
      } catch (refreshError) {
        // If the refresh token is invalid or has expired
        throw { message: "Refresh token is invalid or expired", status: 403 };
      }
    } else {
      // If the token is invalid for some other reason
      throw { message: "Access token is invalid or expired", status: 403 };
    }
  }
};

module.exports = verifyAccessTokenAndRefresh;
