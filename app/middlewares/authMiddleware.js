const logoutUserMiddleware = {
  requireUser: true, // Ensures that only authenticated users can access this function
};

const deleteUserMiddleware = {
  requireMaster: true, // Ensures that masterKey is provided
};

module.exports = { logoutUserMiddleware, deleteUserMiddleware };
