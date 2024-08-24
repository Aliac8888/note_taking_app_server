const noteController = require("../controllers/noteController");
const noteMiddleware = require("../middlewares/noteMiddleware");

module.exports = function (Parse) {
  // Get notes stats
  Parse.Cloud.define(
    "getNotesStats",
    noteController.getNotesStats,
    noteMiddleware.getNotesStatsMiddleware
  );

  // Create note
  Parse.Cloud.define(
    "createNote",
    noteController.createNote,
    noteMiddleware.createNoteMiddleware
  );

  // Get current user's Notes
  Parse.Cloud.define(
    "getMyNotes",
    noteController.getMyNotes,
    noteMiddleware.getMyNotesMiddleware
  );

  // Update note
  Parse.Cloud.define(
    "updateNote",
    noteController.updateNote,
    noteMiddleware.updateNoteMiddleware
  );

  // Delete note
  Parse.Cloud.define(
    "deleteNote",
    noteController.deleteNote,
    noteMiddleware.deleteNoteMiddleware
  );

  // Share note
  Parse.Cloud.define(
    "shareNote",
    noteController.shareNote,
    noteMiddleware.shareNoteMiddleware
  );
};
