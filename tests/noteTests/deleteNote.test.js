const Parse = require("parse/node");
const { deleteNote } = require("../../app/controllers/noteController");
const Note = require("../../app/models/note");

// Mock Parse methods
jest.mock("parse/node", () => {
  const actualParse = jest.requireActual("parse/node");
  return {
    ...actualParse,
    Error: jest.fn().mockImplementation((code, message) => {
      return { code, message };
    }),
  };
});

jest.mock("../../app/models/note");

describe("deleteNote", () => {
  const mockRequest = {
    user: {
      getSessionToken: jest.fn().mockReturnValue("sessionToken123"), // Mocked session token
    },
    params: {
      noteId: "note123",
    },
  };

  afterEach(() => {
    jest.clearAllMocks(); // Reset mocks after each test
  });

  it("should delete the note successfully", async () => {
    // Mock the deleteNote method to resolve
    Note.deleteNote.mockResolvedValue();

    const result = await deleteNote(mockRequest);

    // Assertions
    expect(Note.deleteNote).toHaveBeenCalledWith(
      mockRequest.params.noteId,
      "sessionToken123"
    );
    expect(result).toEqual({
      message: "Note deleted successfully",
    });
  });

  it("should throw an error if note deletion fails", async () => {
    const mockError = new Error("Failed to delete note");

    // Mock the deleteNote method to throw an error
    Note.deleteNote.mockRejectedValue(mockError);

    try {
      await deleteNote(mockRequest);
    } catch (error) {
      expect(Note.deleteNote).toHaveBeenCalledWith(
        mockRequest.params.noteId,
        "sessionToken123"
      );
      expect(error.message).toBe(
        "Error while deleting note: Failed to delete note"
      );
    }
  });
});