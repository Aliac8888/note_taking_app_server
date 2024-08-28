/**
 * Creates the "Admin" role with the necessary permissions if it doesn't exist.
 * @returns {Promise<Parse.Role>} A promise that resolves to the created or existing Admin role.
 * @throws {Parse.Error} If an error occurs during role creation.
 */
async function createAdminRole() {
  const roleACL = new Parse.ACL();
  roleACL.setPublicReadAccess(true); // Allows the role to be seen by everyone
  roleACL.setRoleWriteAccess("Admin", true); // Allows only Admins to modify this role

  const adminRole = new Parse.Role("Admin", roleACL);
  return await adminRole.save(null, { useMasterKey: true });
}

/**
 * Assigns a user to the "Admin" role. If the role does not exist, it will be created.
 * @param {Parse.User} user - The user to assign to the Admin role.
 * @returns {Promise<void>} A promise that resolves when the user has been assigned to the role.
 * @throws {Parse.Error} If an error occurs during role assignment.
 */
async function assignAdminRole(user) {
  const roleQuery = new Parse.Query(Parse.Role);
  roleQuery.equalTo("name", "Admin");

  let adminRole = await roleQuery.first({ useMasterKey: true });

  // If the Admin role doesn't exist, create it
  if (!adminRole) {
    adminRole = await createAdminRole();
  }

  // Add the user to the Admin role
  adminRole.getUsers().add(user);
  await adminRole.save(null, { useMasterKey: true });
}

/**
 * Creates the "User" role with the necessary permissions if it doesn't exist.
 * @returns {Promise<Parse.Role>} A promise that resolves to the created or existing User role.
 * @throws {Parse.Error} If an error occurs during role creation.
 */
async function createUserRole() {
  const roleACL = new Parse.ACL();
  roleACL.setPublicReadAccess(true); // Allows the role to be seen by everyone
  roleACL.setPublicWriteAccess(false); // Restricts modification to specific users

  const userRole = new Parse.Role("User", roleACL);
  return await userRole.save(null, { useMasterKey: true });
}

/**
 * Assigns a user to the "User" role. If the role does not exist, it will be created.
 * @param {Parse.User} user - The user to assign to the User role.
 * @returns {Promise<void>} A promise that resolves when the user has been assigned to the role.
 * @throws {Parse.Error} If an error occurs during role assignment.
 */
async function assignUserRole(user) {
  const roleQuery = new Parse.Query(Parse.Role);
  roleQuery.equalTo("name", "User");

  let userRole = await roleQuery.first({ useMasterKey: true });

  // If the User role doesn't exist, create it
  if (!userRole) {
    userRole = await createUserRole();
  }

  // Add the user to the User role
  userRole.getUsers().add(user);
  await userRole.save(null, { useMasterKey: true });
}

module.exports = {
  createAdminRole,
  assignAdminRole,
  createUserRole,
  assignUserRole,
};
