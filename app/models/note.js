class Note extends Parse.Object {
  constructor() {
    super("Note");
  }

  // Static method to get the Note class schema fields
  static getFields() {
    return {
      title: "String",
      content: "String",
      author: "Pointer<_User>",
    };
  }

  // Static method to create a new note
  static async createNote(title, content, author) {
    const note = new Note();
    note.set("title", title);
    note.set("content", content);
    note.set("author", author);

    // Set ACL so only the owner has full access
    const acl = new Parse.ACL(author);
    acl.setPublicReadAccess(false);
    note.setACL(acl);

    return await note.save();
  }

  // Static method to get all notes of the user
  static async getNotesByAuthor(user) {
    const noteQuery = new Parse.Query(Note);
    noteQuery.equalTo("author", user);
    return await noteQuery.find({ useMasterKey: true });
  }

  // Static method to update a note
  static async updateNote(noteId, title, content, sessionToken) {
    const noteQuery = new Parse.Query(Note);
    const note = await noteQuery.get(noteId, { sessionToken });

    note.set("title", title);
    note.set("content", content);

    return await note.save(null, { sessionToken });
  }

  // Static method to delete a note
  static async deleteNote(noteId, sessionToken) {
    const noteQuery = new Parse.Query(Note);
    const note = await noteQuery.get(noteId, { sessionToken });

    return await note.destroy({ sessionToken });
  }

  // Static method to share note with another user
  static async shareNotePermissions(noteId, targetUser, permission) {
    const noteQuery = new Parse.Query(Note);
    const note = await noteQuery.get(noteId, { useMasterKey: true });
    const acl = note.getACL();

    if (permission === "read") {
      acl.setReadAccess(targetUser, true);
    } else if (permission === "write") {
      acl.setWriteAccess(targetUser, true);
    } else if (permission === "delete") {
      acl.setDeleteAccess(targetUser, true);
    }

    note.setACL(acl);
    return await note.save(null, { useMasterKey: true });
  }
}

Parse.Object.registerSubclass("Note", Note);

module.exports = Note;
