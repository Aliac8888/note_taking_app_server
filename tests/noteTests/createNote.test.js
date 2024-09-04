const Parse = require("parse/node");
const { createNote } = require("../../app/controllers/noteController");
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

jest.mock("../../app/models/note"); // why did we mock this ?

describe("createNote", () => {
  const mockRequest = {
    user: { id: "user123" }, // Mocked logged-in user
    params: {
      title: "Test Note",
      content: "This is a test note content.",
    },
  };

  afterEach(() => {
    jest.clearAllMocks(); // Reset mocks after each test
  });

  it("should create a note successfully", async () => {
    const mockNote = { id: "note123" };
    // Mock the createNote method to return a note object
    Note.createNote.mockResolvedValue(mockNote);

    const result = await createNote(mockRequest);

    // Assertions
    expect(Note.createNote).toHaveBeenCalledWith(
      mockRequest.params.title,
      mockRequest.params.content,
      mockRequest.user
    );
    expect(result).toEqual({
      message: "Note created successfully",
      noteId: mockNote.id,
    });
  });

  it("should throw an error if note creation fails", async () => {
    const mockError = new Error("Failed to create note");

    // Mock the createNote method to throw an error
    Note.createNote.mockRejectedValue(mockError);

    try {
      await createNote(mockRequest);
    } catch (error) {
      expect(Note.createNote).toHaveBeenCalledWith(
        mockRequest.params.title,
        mockRequest.params.content,
        mockRequest.user
      );
      expect(error.message).toBe(
        "Error while creating note: Failed to create note"
      );
    }
  });
});
