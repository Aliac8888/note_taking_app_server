class Note extends Parse.Object {
  constructor() {
    super("Note");
  }

  /**
   * Static method to get the schema fields of the Note class.
   * @returns {Object} An object representing the schema fields of the Note class.
   */
  static getFields() {
    return {
      title: "String",
      content: "String",
      author: "Pointer<_User>",
    };
  }

  /**
   * Static method to create a new note.
   * @param {string} title - The title of the note.
   * @param {string} content - The content of the note.
   * @param {Parse.User} author - The currently logged-in user who is the author of the note.
   * @returns {Promise<Parse.Object>} A promise that resolves to the created note object.
   * @throws {Parse.Error} If there is an error during note creation.
   */
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

  /**
   * Static method to retrieve all notes by a specific author.
   * @param {Parse.User} user - The author of the notes.
   * @returns {Promise<Parse.Object[]>} A promise that resolves to an array of notes created by the specified user.
   */
  static async getNotesByAuthor(user) {
    const noteQuery = new Parse.Query(Note);
    noteQuery.equalTo("author", user);
    return await noteQuery.find({ useMasterKey: true });
  }

  /**
   * Static method to update a note by its ID.
   * @param {string} noteId - The ID of the note to update.
   * @param {string} title - The new title of the note.
   * @param {string} content - The new content of the note.
   * @param {string} sessionToken - The session token of the user updating the note.
   * @returns {Promise<Parse.Object>} A promise that resolves to the updated note object.
   * @throws {Parse.Error} If there is an error during note update.
   */
  static async updateNote(noteId, title, content, sessionToken) {
    const noteQuery = new Parse.Query(Note);
    const note = await noteQuery.get(noteId, { sessionToken });

    note.set("title", title);
    note.set("content", content);

    return await note.save(null, { sessionToken });
  }

  /**
   * Static method to delete a note by its ID.
   * @param {string} noteId - The ID of the note to delete.
   * @param {string} sessionToken - The session token of the user deleting the note.
   * @returns {Promise<void>} A promise that resolves when the note is successfully deleted.
   * @throws {Parse.Error} If there is an error during note deletion.
   */
  static async deleteNote(noteId, sessionToken) {
    const noteQuery = new Parse.Query(Note);
    const note = await noteQuery.get(noteId, { sessionToken });

    return await note.destroy({ sessionToken });
  }

  /**
   * Static method to share a note with another user by modifying its ACL permissions.
   * @param {string} noteId - The ID of the note to share.
   * @param {Parse.User} targetUser - The user with whom to share the note.
   * @param {string} permission - The permission level to grant ('read', 'write', or 'delete').
   * @returns {Promise<Parse.Object>} A promise that resolves to the updated note object.
   * @throws {Parse.Error} If there is an error during the sharing of the note.
   */
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
