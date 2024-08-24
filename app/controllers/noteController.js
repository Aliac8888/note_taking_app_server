const Note = require("../models/note");

/**
 * Handles fetching stats
 * @param {Object} request - Parse Cloud request object
 * @param {Object} request.master - Master key for admin access (required)
 * @returns {Promise<Object>} Message indicating successful operation along with the stats
 * @throws {Parse.Error} If there is an error during fetching stats
 */
async function getNotesStats(request) {
  try {
    const noteQuery = new Parse.Query(Note);
    const stats = await noteQuery.aggregate([
      {
        $group: {
          _id: "$author", // Group by the author's ID
          count: { $sum: 1 }, // Count the number of notes
        },
      },
    ]);
    return { message: "Fetched stats successfully", stats };
  } catch (error) {
    throw new Parse.Error(
      Parse.Error.INTERNAL_SERVER_ERROR,
      `Error fetching stats: ${error.message}`
    );
  }
}

/**
 * Handles creating a new note
 * @param {Object} request - Parse Cloud request object
 * @param {Parse.User} request.user - The currently logged-in user
 * @param {Object} request.params - Request parameters
 * @param {string} request.params.title - Title of the note
 * @param {string} request.params.content - Content of the note
 * @returns {Promise<Object>} Message indicating successful operation along with the noteId
 * @throws {Parse.Error} If there is an error during note creation
 */
async function createNote(request) {
  try {
    const note = await Note.createNote(
      request.params.title,
      request.params.content,
      request.user
    );
    return { message: "Note created successfully", noteId: note.id };
  } catch (error) {
    throw new Parse.Error(
      Parse.Error.INTERNAL_SERVER_ERROR,
      `Error while creating note: ${error.message}`
    );
  }
}

/**
 * Handles retrieving notes created by the current user
 * @param {Object} request - Parse Cloud request object
 * @param {Parse.User} request.user - The currently logged-in user
 * @returns {Promise<Object>} Message indicating successful operation along with the notes
 * @throws {Parse.Error} If there is an error during note retrieval
 */
async function getMyNotes(request) {
  try {
    const notes = await Note.getNotesByAuthor(request.user);
    return { message: "Notes returned successfully", notes };
  } catch (error) {
    throw new Parse.Error(
      Parse.Error.INTERNAL_SERVER_ERROR,
      `Error while retrieving notes: ${error.message}`
    );
  }
}

/**
 * Handles updating an existing note
 * @param {Object} request - Parse Cloud request object
 * @param {Parse.User} request.user - The currently logged-in user
 * @param {Object} request.params - Request parameters
 * @param {string} request.params.noteId - ID of the note to update
 * @param {string} request.params.title - New title of the note
 * @param {string} request.params.content - New content of the note
 * @returns {Promise<Object>} Message indicating successful operation
 * @throws {Parse.Error} If there is an error during note update
 */
async function updateNote(request) {
  const { title, content, noteId } = request.params;
  try {
    const note = await Note.updateNote(
      noteId,
      title,
      content,
      request.user.getSessionToken()
    );
    return { message: "Note updated successfully", noteId: note.id };
  } catch (error) {
    throw new Parse.Error(
      Parse.Error.INTERNAL_SERVER_ERROR,
      `Error while updating note: ${error.message}`
    );
  }
}

/**
 * Handles deleting a note
 * @param {Object} request - Parse Cloud request object
 * @param {Parse.User} request.user - The currently logged-in user
 * @param {Object} request.params - Request parameters
 * @param {string} request.params.noteId - ID of the note to delete
 * @returns {Promise<Object>} Message indicating successful operation
 * @throws {Parse.Error} If there is an error during note deletion
 */
async function deleteNote(request) {
  try {
    await Note.deleteNote(
      request.params.noteId,
      request.user.getSessionToken()
    );
    return { message: "Note deleted successfully" };
  } catch (error) {
    throw new Parse.Error(
      Parse.Error.INTERNAL_SERVER_ERROR,
      `Error while deleting note: ${error.message}`
    );
  }
}

/**
 * Handles sharing a note with another user
 * @param {Object} request - Parse Cloud request object
 * @param {Object} request.params - Request parameters
 * @param {string} request.params.noteId - ID of the note to share
 * @param {string} request.params.userId - ID of the user to share the note with
 * @param {string} request.params.permission - Permission level ("read", "write", "delete")
 * @returns {Promise<Object>} Message indicating successful operation
 * @throws {Parse.Error} If there is an error during note sharing
 */
async function shareNote(request) {
  const { permission, userId, noteId } = request.params;
  try {
    const userQuery = new Parse.Query(Parse.User);
    const targetUser = await userQuery.get(userId, {
      useMasterKey: true,
    });

    await Note.shareNotePermissions(noteId, targetUser, permission);
    return { message: "Note shared successfully" };
  } catch (error) {
    throw new Parse.Error(
      Parse.Error.INTERNAL_SERVER_ERROR,
      `Error while sharing note: ${error.message}`
    );
  }
}

module.exports = {
  getNotesStats,
  createNote,
  getMyNotes,
  updateNote,
  deleteNote,
  shareNote,
};
