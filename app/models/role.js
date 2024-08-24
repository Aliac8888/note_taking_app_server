/**
 * Creates the Admin role if it doesn't exist
 * @returns {Promise<Parse.Role>} The created or existing Admin role
 */
async function createAdminRole() {
  const roleACL = new Parse.ACL();
  roleACL.setPublicReadAccess(true); // Allows the role to be seen by everyone
  roleACL.setRoleWriteAccess("Admin", true); // Allows only Admins to modify this role

  const adminRole = new Parse.Role("Admin", roleACL);
  return await adminRole.save(null, { useMasterKey: true });
}

/**
 * Assigns a user to the Admin role
 * @param {Parse.User} user - The user to assign to the Admin role
 * @returns {Promise<void>}
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
 * Creates the User role if it doesn't exist
 * @returns {Promise<Parse.Role>} The created or existing User role
 */
async function createUserRole() {
  const roleACL = new Parse.ACL();
  roleACL.setPublicReadAccess(true); // Allows the role to be seen by everyone
  roleACL.setPublicWriteAccess(false); // Restricts modification to specific users

  const userRole = new Parse.Role("User", roleACL);
  return await userRole.save(null, { useMasterKey: true });
}

/**
 * Assigns a user to the User role
 * @param {Parse.User} user - The user to assign to the User role
 * @returns {Promise<void>}
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
