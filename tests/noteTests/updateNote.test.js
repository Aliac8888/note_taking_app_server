const Parse = require("parse/node");
const { updateNote } = require("../../app/controllers/noteController");
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

describe("updateNote", () => {
  const mockRequest = {
    user: {
      getSessionToken: jest.fn().mockReturnValue("sessionToken123"), // Mocked session token
    },
    params: {
      noteId: "note123",
      title: "Updated Title",
      content: "Updated Content",
    },
  };

  afterEach(() => {
    jest.clearAllMocks(); // Reset mocks after each test
  });

  it("should update the note successfully", async () => {
    const mockNote = {
      id: "note123",
      title: "Updated Title",
      content: "Updated Content",
    };

    // Mock the updateNote method to return the updated note
    Note.updateNote.mockResolvedValue(mockNote);

    const result = await updateNote(mockRequest);

    // Assertions
    expect(Note.updateNote).toHaveBeenCalledWith(
      mockRequest.params.noteId,
      mockRequest.params.title,
      mockRequest.params.content,
      "sessionToken123"
    );
    expect(result).toEqual({
      message: "Note updated successfully",
      noteId: mockNote.id,
    });
  });

  it("should throw an error if note update fails", async () => {
    const mockError = new Error("Failed to update note");

    // Mock the updateNote method to throw an error
    Note.updateNote.mockRejectedValue(mockError);

    try {
      await updateNote(mockRequest);
    } catch (error) {
      expect(Note.updateNote).toHaveBeenCalledWith(
        mockRequest.params.noteId,
        mockRequest.params.title,
        mockRequest.params.content,
        "sessionToken123"
      );
      expect(error.message).toBe(
        "Error while updating note: Failed to update note"
      );
    }
  });
});
