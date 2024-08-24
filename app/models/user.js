const errors = require("../constants/errorMessages");

/**
 * Creates a new user
 * @param {string} username - The username of the new user
 * @param {string} password - The password of the new user
 * @param {string} email - The email of the new user
 * @returns {Promise<Parse.User>} The created user object
 */
async function createUser(username, password, email) {
  const user = new Parse.User();
  user.set("username", username);
  user.set("password", password);
  user.set("email", email);

  try {
    return await user.signUp();
  } catch (error) {
    if (
      error.code === Parse.Error.USERNAME_TAKEN ||
      error.code === Parse.Error.EMAIL_TAKEN
    ) {
      throw new Parse.Error(Parse.Error.USERNAME_TAKEN, errors.USERNAME_EXISTS);
    }
    throw new Parse.Error(
      Parse.Error.INTERNAL_SERVER_ERROR,
      `Error while creating user: ${error.message}`
    );
  }
}

/**
 * Fetches a user by username
 * @param {string} username - The username of the user to fetch
 * @returns {Promise<Parse.User|null>} The fetched user object or null if not found
 */
async function getUserByUsername(username) {
  const query = new Parse.Query(Parse.User);
  query.equalTo("username", username);
  return await query.first({ useMasterKey: true });
}

/**
 * Deletes a user and associated sessions
 * @param {Parse.User} user - The user to delete
 * @returns {Promise<void>} Resolves when the user is deleted
 */
async function deleteUser(user) {
  const sessionQuery = new Parse.Query(Parse.Session);
  sessionQuery.equalTo("user", user);
  const sessions = await sessionQuery.find({ useMasterKey: true });

  if (sessions.length > 0) {
    await Parse.Object.destroyAll(sessions, { useMasterKey: true });
  }

  await user.destroy({ useMasterKey: true });
}

module.exports = {
  createUser,
  getUserByUsername,
  deleteUser,
};
