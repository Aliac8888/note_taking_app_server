const { ensureClassExists } = require("./helpers/schema-helper");

Parse.Cloud.define(
  "createNote",
  async (request) => {
    // Ensure the Note class exists or create it with the specified fields
    await ensureClassExists("Note", {
      title: "String",
      content: "String",
      author: "Pointer<_User>", // Author field to store the user who created the note
    });

    const Note = Parse.Object.extend("Note");
    const note = new Note();

    note.set("title", request.params.title);
    note.set("content", request.params.content);
    note.set("author", request.user); // Set the author as the current user

    // Set ACL so only the owner has full access
    const acl = new Parse.ACL(request.user);
    acl.setPublicReadAccess(false); // No public read
    note.setACL(acl);

    try {
      await note.save();
      return { message: "Note created successfully", noteId: note.id };
    } catch (error) {
      throw new Parse.Error(
        Parse.Error.INTERNAL_SERVER_ERROR,
        `Error while creating note: ${error.message}`
      );
    }
  },
  {
    fields: ["title", "content"],
    requireUser: true, // Ensures that only authenticated users can access this function
  }
);

Parse.Cloud.define(
  "getMyNotes",
  async (request) => {
    // Ensure the Note class exists or create it with the specified fields
    const classCheckResult = await ensureClassExists("Note", {
      title: "String",
      content: "String",
      author: "Pointer<_User>", // Author field is required
    });

    if (classCheckResult) {
      const noteQuery = new Parse.Query("Note");
      noteQuery.equalTo("author", request.user); // Filter notes by the current user

      try {
        const notes = await noteQuery.find({ useMasterKey: true }); // Find notes for the user
        return { message: "Notes returned successfully", notes };
      } catch (error) {
        throw new Parse.Error(
          Parse.Error.INTERNAL_SERVER_ERROR,
          `Error while retrieving notes: ${error.message}`
        );
      }
    } else {
      throw new Parse.Error(
        Parse.Error.INTERNAL_SERVER_ERROR,
        `Error while retrieving notes: Couldn't Fetch Notes`
      );
    }
  },
  {
    requireUser: true, // Ensures that only authenticated users can access this function
  }
);

Parse.Cloud.define(
  "deleteNote",
  async (request) => {
    const noteId = request.params.noteId;

    // Query to find the note by ID
    const noteQuery = new Parse.Query("Note");

    try {
      const note = await noteQuery.get(noteId, {
        sessionToken: request.user.getSessionToken(),
      });

      // If the note exists and the user has access (due to ACL), delete the note
      await note.destroy({ sessionToken: request.user.getSessionToken() });

      return { message: "Note deleted successfully" };
    } catch (error) {
      throw new Parse.Error(
        Parse.Error.INTERNAL_SERVER_ERROR,
        `Error while deleting note: ${error.message}`
      );
    }
  },
  {
    requireUser: true, // Ensures that only authenticated users can access this function
  }
);

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
