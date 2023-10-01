const { findByID } = require("../models/User");

const verifyIfUserAdmin = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const retrieved_user = await findByID({ id: userId });
    if (!retrieved_user || !retrieved_user?.is_admin) {
      throw { msg: "Access Denied", status: 403 };
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = verifyIfUserAdmin;
