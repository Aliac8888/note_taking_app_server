Parse.Cloud.define("createNote", async (request) => {
  const Note = Parse.Object.extend("Note");
  const note = new Note();

  note.set("title", request.params.title);
  note.set("content", request.params.content);

  // Set ACL so only the owner has full access
  const acl = new Parse.ACL(request.user);
  acl.setPublicReadAccess(false); // No public read
  note.setACL(acl);

  try {
    await note.save();
    return { message: "Note created successfully", noteId: note.id };
  } catch (error) {
    throw new Error("Error while creating note: " + error.message);
  }
});

Parse.Cloud.define("shareNote", async (request) => {
  const noteId = request.params.noteId;
  const userId = request.params.userId;
  const permission = request.params.permission; // "read", "write", "delete"

  const noteQuery = new Parse.Query("Note");
  const note = await noteQuery.get(noteId);

  // Ensure the requesting user is the note owner
  if (note.getACL().getWriteAccess(request.user)) {
    const userQuery = new Parse.Query(Parse.User);
    const targetUser = await userQuery.get(userId);

    if (permission === "read") {
      note.getACL().setReadAccess(targetUser, true);
    } else if (permission === "write") {
      note.getACL().setWriteAccess(targetUser, true);
    } else if (permission === "delete") {
      note.getACL().setDeleteAccess(targetUser, true);
    }

    try {
      await note.save();
      return { message: "User permissions updated successfully" };
    } catch (error) {
      throw new Error(`Error while creating note: ${error.message}`);
    }
  } else {
    throw new Error("You do not have permission to share this note");
  }
});
