const getNotesStatsMiddleware = {
  requireMaster: true, // Ensures to continue the process only if masterKey is provided
};

const createNoteMiddleware = {
  requireUser: true, // Ensures that only authenticated users can access this function
};

const getMyNotesMiddleware = {
  requireUser: true,
};

const updateNoteMiddleware = {
  fields: ["title", "content", "noteId"],
  requireUser: true,
};

const deleteNoteMiddleware = {
  fields: ["noteId"],
  requireUser: true,
};

const shareNoteMiddleware = {
  fields: ["noteId", "userId", "permission"],
  requireUser: true,
};

module.exports = {
  getNotesStatsMiddleware,
  createNoteMiddleware,
  getMyNotesMiddleware,
  updateNoteMiddleware,
  deleteNoteMiddleware,
  shareNoteMiddleware,
};
