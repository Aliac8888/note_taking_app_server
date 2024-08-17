const { createUser } = require("./helpers/auth-helper");
const { assignAdminRole, assignUserRole } = require("./helpers/role-helper");

Parse.Cloud.define("userSignup", async (request) => {
  const { username, password, email, isAdmin } = request.params;

  // Check if trying to create an admin without the master key
  if (isAdmin && !request.master) {
    throw new Parse.Error(
      Parse.Error.OPERATION_FORBIDDEN,
      "Master Key Required For Creating Admin"
    );
  }

  try {
    // Sign up the user
    const user = await createUser(username, password, email);

    // Assign the user to the default User role
    await assignUserRole(user);

    // If the user is an admin, also assign them to the Admin role
    if (isAdmin) {
      await assignAdminRole(user);
    }

    return { message: "User signed up successfully" };
  } catch (error) {
    throw new Parse.Error(
      Parse.Error.INTERNAL_SERVER_ERROR,
      `Error while signing up user: ${error.message}`
    );
  }
});

Parse.Cloud.define("userLogin", async (request) => {
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
      `Error while Loggin in user: ${error.message}`
    );
  }
});

Parse.Cloud.define(
  "userLogout",
  async (request) => {
    const sessionToken = request.user.getSessionToken();

    try {
      // Manually destroy the session
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
        `Error while logging out user: ${error.message}`
      );
    }
  },
  {
    requireUser: true, // Ensures that only authenticated users can access this function
  }
);

Parse.Cloud.define("deleteUser", async (request) => {
  const username = request.params.username;

  // Check if the master key was used in the request
  if (!request.master) {
    throw new Parse.Error(
      Parse.Error.OPERATION_FORBIDDEN,
      `Unauthorized: MasterKey is required.`
    );
  }

  const query = new Parse.Query(Parse.User);
  query.equalTo("username", username);

  try {
    const user = await query.first({ useMasterKey: true });

    if (!user) {
      throw new Parse.Error(
        Parse.Error.INTERNAL_SERVER_ERROR,
        `User not found.`
      );
    }

    // Manually destroy the sessions associated with the user
    const sessionQuery = new Parse.Query(Parse.Session);
    sessionQuery.equalTo("user", user);
    const sessions = await sessionQuery.find({ useMasterKey: true });

    if (sessions.length > 0) {
      await Parse.Object.destroyAll(sessions, { useMasterKey: true });
    }

    // Destroy the user
    await user.destroy({ useMasterKey: true });

    return { message: `User ${username} deleted successfully.` };
  } catch (error) {
    throw new Parse.Error(
      Parse.Error.INTERNAL_SERVER_ERROR,
      `Error while deleting user: ${error.message}`
    );
  }
});
