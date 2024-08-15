// Helper function to create the Admin role
async function createAdminRole() {
  const roleACL = new Parse.ACL();
  roleACL.setPublicReadAccess(true); // Allows the role to be seen by everyone
  roleACL.setRoleWriteAccess("Admin", true); // Allows only Admins to modify this role

  const adminRole = new Parse.Role("Admin", roleACL);
  return await adminRole.save(null, { useMasterKey: true });
}

// Helper function to assign the user to the Admin role
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

module.exports = {
  createAdminRole,
  assignAdminRole,
};
