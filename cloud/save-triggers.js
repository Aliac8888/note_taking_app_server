// Parse.Cloud.beforeSave(Parse.User, async (request) => {
//   const user = request.object;
//   if (!user.existed()) {
//     const roleACL = new Parse.ACL();
//     roleACL.setPublicReadAccess(false);
//     roleACL.setRoleWriteAccess("Admin", true);

//     const adminRole = new Parse.Role("Admin", roleACL);
//     await adminRole.save();

//     const acl = new Parse.ACL(user);
//     acl.setRoleReadAccess("Admin", true);
//     user.setACL(acl);
//   }
// });

Parse.Cloud.afterSave(Parse.User, async (request) => {
  const user = request.object;
  if (request.context.isAdmin) {
    // Assume `isAdmin` is set during signup
    const roleACL = new Parse.ACL();
    roleACL.setPublicReadAccess(true);
    roleACL.setPublicWriteAccess(false);

    const adminRole = new Parse.Role("Admin", roleACL);
    adminRole.getUsers().add(user);
    await adminRole.save();
  } else {
    const roleACL = new Parse.ACL();
    roleACL.setPublicReadAccess(true);
    roleACL.setPublicWriteAccess(false);

    const userRole = new Parse.Role("User", roleACL);
    userRole.getUsers().add(user);
    await userRole.save();
  }
});
