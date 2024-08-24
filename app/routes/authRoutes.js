const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

module.exports = function (Parse) {
  // User signup
  Parse.Cloud.define("userSignup", authController.userSignup);

  // User login
  Parse.Cloud.define("userLogin", authController.userLogin);

  // User logout
  Parse.Cloud.define(
    "userLogout",
    authController.userLogout,
    authMiddleware.logoutUserMiddleware
  );

  // Delete user
  Parse.Cloud.define(
    "deleteUser",
    authController.deleteUser,
    authMiddleware.deleteUserMiddleware
  );
};
