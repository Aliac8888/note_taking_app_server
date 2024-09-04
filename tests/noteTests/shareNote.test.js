const Parse = require("parse/node");
const { shareNote } = require("../../app/controllers/noteController");
const Note = require("../../app/models/note");

// Mock Parse methods
jest.mock("parse/node", () => {
  const actualParse = jest.requireActual("parse/node");
  return {
    ...actualParse,
    Error: jest.fn().mockImplementation((code, message) => {
      return { code, message };
    }),
    Query: jest.fn(() => ({
      get: jest.fn(),
    })),
  };
});

jest.mock("../../app/models/note");

describe("shareNote", () => {
  const mockRequest = {
    params: {
      noteId: "note123",
      userId: "user456",
      permission: "read",
    },
  };

  afterEach(() => {
    jest.clearAllMocks(); // Reset mocks after each test
  });

  it("should share the note successfully", async () => {
    const mockTargetUser = { id: "user456" };

    // Mock the Parse.Query.get method to return a user
    Parse.Query.mockImplementation(() => ({
      get: jest.fn().mockResolvedValue(mockTargetUser),
    }));

    // Mock the shareNotePermissions method to resolve successfully
    Note.shareNotePermissions.mockResolvedValue();

    const result = await shareNote(mockRequest);

    // Assertions
    expect(Parse.Query).toHaveBeenCalledWith(Parse.User);
    expect(Note.shareNotePermissions).toHaveBeenCalledWith(
      mockRequest.params.noteId,
      mockTargetUser,
      mockRequest.params.permission
    );
    expect(result).toEqual({
      message: "Note shared successfully",
    });
  });

  it("should throw an error if note sharing fails", async () => {
    const mockError = new Error("Failed to share note");

    // Mock the Parse.Query.get method to throw an error
    Parse.Query.mockImplementation(() => ({
      get: jest.fn().mockRejectedValue(mockError),
    }));

    try {
      await shareNote(mockRequest);
    } catch (error) {
      expect(Parse.Query).toHaveBeenCalledWith(Parse.User);
      expect(error.message).toBe(
        "Error while sharing note: Failed to share note"
      );
    }
  });
});