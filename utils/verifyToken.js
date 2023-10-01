const jwt = require("jsonwebtoken");

const SECURE_COOKIES = process.env.COOKIE_SECURE == "true";
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN;
const COOKIE_SAME_SITE = process.env.COOKIE_SAME_SITE;
const COOKIE_HTTP_ONLY = process.env.COOKIE_HTTP_ONLY == "true";
const ACCESS_MAX_AGE = parseInt(process.env.ACCESS_MAX_AGE);

// Function to generate a new access token
const generateAccessToken = (user) => {
  return jwt.sign({ userId: user.id }, process.env.SECRET_KEY, {
    expiresIn: "15m", // Set the new access token expiration time as needed
  });
};

const verifyAccessTokenAndRefresh = (req, res, next) => {
  // Get the access token and refresh token from cookies
  const accessToken = req.cookies.access_token;
  const refreshToken = req.cookies.refresh_token;

  try {
    if (!refreshToken) {
      throw {
        msg: "Refresh token is missing",
        status: 401,
      };
    }

    // Verify and decode the access token
    jwt.verify(accessToken, process.env.SECRET_KEY, function (err, decoded) {
      if (err) {
        // If the acess token has expired,we have to check of the refresh token is valid or not
        jwt.verify(
          refreshToken,
          process.env.REFRESH_SECRET_KEY,
          function (ref_err, ref_decoded) {
            if (ref_err) {
              throw {
                msg: "Refresh token is invalid or expired",
                status: 403,
              };
            } else {
              // If refresh token is not expired, then generate a new accesstoken
              req.user = ref_decoded;
              const newAccessToken = generateAccessToken(ref_decoded);
              // Set the new access token in the response cookie
              res.cookie("access_token", newAccessToken, {
                maxAge: ACCESS_MAX_AGE, // Set the new access token expiration time as needed
                httpOnly: COOKIE_HTTP_ONLY,
                secure: SECURE_COOKIES,
                domain: COOKIE_DOMAIN,
                sameSite: COOKIE_SAME_SITE,
              });
            }
          }
        );
      } else {
        req.user = jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY);
      }
    });

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = verifyAccessTokenAndRefresh;
