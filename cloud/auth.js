const { createUser } = require("./helpers/auth-helper");
const { assignAdminRole } = require("./helpers/role-helper");

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

    // If the user is an admin, assign them to the Admin role
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

Parse.Cloud.define("deleteUser", async (request) => {
  const username = request.params.username;

  // Check if the master key was used in the request
  if (!request.master) {
    throw new Error("Unauthorized: MasterKey is required.");
  }

  const query = new Parse.Query(Parse.User);
  query.equalTo("username", username);

  try {
    const user = await query.first({ useMasterKey: true });

    if (!user) {
      throw new Error("User not found.");
    }

    await user.destroy({ useMasterKey: true });

    return { message: `User ${username} deleted successfully.` };
  } catch (error) {
    throw new Error(
      `Error code : (${error.code}) while deleting user: ${error.message}`
    );
  }
});
