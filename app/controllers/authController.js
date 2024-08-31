const Parse = require("parse/node"); // Add this line
const User = require("../models/user");
const roleModel = require("../models/role");
const errors = require("../constants/errorMessages");

/**
 * Handles user signup
 * @param {Object} request - Parse Cloud request object
 * @param {Object} request.params - Request parameters
 * @param {string} request.params.username - Username of the new user
 * @param {string} request.params.password - Password of the new user
 * @param {string} request.params.email - Email of the new user
 * @param {boolean} request.params.isAdmin - Whether the new user is an admin
 * @param {Object} [request.master] - Master key for admin access (optional)
 * @returns {Promise<Object>} Message indicating successful operation
 * @throws {Parse.Error} If there is an error during signup
 */
async function userSignup(request) {
  const { username, password, email, isAdmin } = request.params;

  // Check if trying to create an admin without the master key
  if (isAdmin && !request.master) {
    throw new Parse.Error(
      Parse.Error.OPERATION_FORBIDDEN,
      errors.MASTER_KEY_REQUIRED
    );
  }

  try {
    // Sign up the user
    const user = await User.createUser(username, password, email);

    // Assign roles
    await roleModel.assignUserRole(user);
    if (isAdmin) {
      await roleModel.assignAdminRole(user);
    }

    return { message: "User signed up successfully" };
  } catch (error) {
    throw new Parse.Error(
      Parse.Error.INTERNAL_SERVER_ERROR,
      `Error signing up user: ${error.message}`
    );
  }
}

/**
 * Handles user login
 * @param {Object} request - Parse Cloud request object
 * @param {Object} request.params - Request parameters
 * @param {string} request.params.username - Username of the user
 * @param {string} request.params.password - Password of the user
 * @returns {Promise<Object>} Message and session token on successful login
 * @throws {Parse.Error} If there is an error during login
 */
async function userLogin(request) {
  const { username, password } = request.params;

  try {
    const user = await Parse.User.logIn(username, password);
    return {
      message: "User logged in successfully",
      sessionToken: user.getSessionToken(),
    };
  } catch (error) {
    throw new Parse.Error(
      Parse.Error.INTERNAL_SERVER_ERROR,
      `Error logging in user: ${error.message}`
    );
  }
}

/**
 * Handles user logout
 * @param {Object} request - Parse Cloud request object
 * @returns {Promise<Object>} Message indicating successful logout
 * @throws {Parse.Error} If there is an error during logout
 */
async function userLogout(request) {
  const sessionToken = request.user.getSessionToken();

  try {
    const sessionQuery = new Parse.Query(Parse.Session);
    sessionQuery.equalTo("sessionToken", sessionToken);
    const session = await sessionQuery.first({ useMasterKey: true });

    if (session) {
      await session.destroy({ useMasterKey: true });
    }

    return { message: "User logged out successfully" };
  } catch (error) {
    throw new Parse.Error(
      Parse.Error.INTERNAL_SERVER_ERROR,
      `Error logging out user: ${error.message}`
    );
  }
}

/**
 * Handles user deletion
 * @param {Object} request - Parse Cloud request object
 * @param {Object} request.params - Request parameters
 * @param {string} request.params.username - Username of the user to be deleted
 * @param {Object} request.master - Master key for admin access
 * @returns {Promise<Object>} Message indicating successful user deletion
 * @throws {Parse.Error} If there is an error during user deletion
 */
async function deleteUser(request) {
  const username = request.params.username;

  if (!request.master) {
    throw new Parse.Error(
      Parse.Error.OPERATION_FORBIDDEN,
      errors.MASTER_KEY_REQUIRED
    );
  }

  try {
    const user = await User.getUserByUsername(username);

    if (!user) {
      throw new Parse.Error(
        Parse.Error.OBJECT_NOT_FOUND,
        errors.USER_NOT_FOUND
      );
    }

    await User.deleteUser(user);

    return { message: `User ${username} deleted successfully.` };
  } catch (error) {
    throw new Parse.Error(
      Parse.Error.INTERNAL_SERVER_ERROR,
      `Error deleting user: ${error.message}`
    );
  }
}

module.exports = { userSignup, userLogin, userLogout, deleteUser };
