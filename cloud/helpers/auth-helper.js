// Helper function to create a new user
async function createUser(username, password, email) {
  const user = new Parse.User();
  user.set("username", username);
  user.set("password", password);
  user.set("email", email);
  return await user.signUp();
}

module.exports = {
  createUser,
};
