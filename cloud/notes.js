const { ensureClassExists } = require("./helpers/schema-helper");

Parse.Cloud.define(
  "createNote",
  async (request) => {
    // Ensure the Note class exists or create it with the specified fields
    const classCheckResult = await ensureClassExists("Note", {
      title: "String",
      content: "String",
      author: "Pointer<_User>", // Author field is required
    });

    if (classCheckResult) {
      const Note = Parse.Object.extend("Note");
      const note = new Note();

      try {
        note.set("title", request.params.title);
        note.set("content", request.params.content);
        note.set("author", request.user); // Set the author as the current user

        // Set ACL so only the owner has full access
        const acl = new Parse.ACL(request.user);
        acl.setPublicReadAccess(false); // No public read
        note.setACL(acl);

        await note.save();
        return { message: "Note created successfully", noteId: note.id };
      } catch (error) {
        throw new Parse.Error(
          Parse.Error.INTERNAL_SERVER_ERROR,
          `Error while creating note: ${error.message}`
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
    fields: ["title", "content"],
    requireUser: true, // Ensures that only authenticated users can access this function
  }
);

Parse.Cloud.define(
  "updateNote",
  async (request) => {
    const { title, content, noteId } = request.params;

    // Ensure the Note class exists or create it with the specified fields
    const classCheckResult = await ensureClassExists("Note", {
      title: "String",
      content: "String",
      author: "Pointer<_User>", // Author field is required
    });

    if (classCheckResult) {
      // Query to find the note by ID
      const noteQuery = new Parse.Query("Note");

      try {
        const note = await noteQuery.get(noteId, {
          sessionToken: request.user.getSessionToken(),
        });

        // Check if the current user has write access to the note
        const acl = note.getACL();
        if (!acl || !acl.getWriteAccess(request.user)) {
          throw new Parse.Error(
            Parse.Error.OPERATION_FORBIDDEN,
            "You do not have permission to update this note."
          );
        }

        // Update the note fields
        note.set("title", title);
        note.set("content", content);

        await note.save(null, { sessionToken: request.user.getSessionToken() });
        return { message: "Note Updated successfully", noteId: note.id };
      } catch (error) {
        throw new Parse.Error(
          Parse.Error.INTERNAL_SERVER_ERROR,
          `Error while updating note: ${error.message}`
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
    fields: ["title", "content", "noteId"],
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

    // Ensure the Note class exists or create it with the specified fields
    const classCheckResult = await ensureClassExists("Note", {
      title: "String",
      content: "String",
      author: "Pointer<_User>", // Author field is required
    });

    if (classCheckResult) {
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
    } else {
      throw new Parse.Error(
        Parse.Error.INTERNAL_SERVER_ERROR,
        `Error while retrieving notes: Couldn't Fetch Notes`
      );
    }
  },
  {
    fields: ["noteId"],
    requireUser: true, // Ensures that only authenticated users can access this function
  }
);

Parse.Cloud.define(
  "shareNote",
  async (request) => {
    const noteId = request.params.noteId;
    const userId = request.params.userId;
    const permission = request.params.permission; // "read", "write", "delete"

    // Ensure the Note class exists or create it with the specified fields
    const classCheckResult = await ensureClassExists("Note", {
      title: "String",
      content: "String",
      author: "Pointer<_User>", // Author field is required
    });

    if (classCheckResult) {
      const noteQuery = new Parse.Query("Note");
      let note;
      try {
        note = await noteQuery.get(noteId, { useMasterKey: true });
      } catch (error) {
        throw new Parse.Error(
          Parse.Error.OBJECT_NOT_FOUND,
          `Note with ID ${noteId} not found or access denied.`
        );
      }

      // Ensure the requesting user is the note owner
      if (note.getACL().getWriteAccess(request.user)) {
        const userQuery = new Parse.Query(Parse.User);

        let targetUser;
        try {
          targetUser = await userQuery.get(userId, { useMasterKey: true });
        } catch (error) {
          throw new Parse.Error(
            Parse.Error.OBJECT_NOT_FOUND,
            `User with ID ${userId} not found or access denied.`
          );
        }

        const noteACL = note.getACL();

        if (permission === "read") {
          noteACL.setReadAccess(targetUser, true);
        } else if (permission === "write") {
          noteACL.setWriteAccess(targetUser, true);
        } else if (permission === "delete") {
          noteACL.setDeleteAccess(targetUser, true);
        }

        note.setACL(noteACL);

        try {
          await note.save(null, { useMasterKey: true });
          return { message: "User permissions updated successfully" };
        } catch (error) {
          throw new Parse.Error(
            Parse.Error.INTERNAL_SERVER_ERROR,
            `Error while updating note permissions: ${error.message}`
          );
        }
      } else {
        throw new Parse.Error(
          Parse.Error.OPERATION_FORBIDDEN,
          `You do not have permission to share this note`
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
    fields: ["noteId", "userId", "permission"],
    requireUser: true,
  }
);
