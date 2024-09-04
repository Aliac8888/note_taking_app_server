const Parse = require("parse/node");
const { getMyNotes } = require("../../app/controllers/noteController");
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

describe("getMyNotes", () => {
  const mockRequest = {
    user: { id: "user123" }, // Mocked logged-in user
  };

  afterEach(() => {
    jest.clearAllMocks(); // Reset mocks after each test
  });

  it("should retrieve notes successfully", async () => {
    const mockNotes = [
      { id: "note1", title: "Note 1", content: "Content 1" },
      { id: "note2", title: "Note 2", content: "Content 2" },
    ];

    // Mock the getNotesByAuthor method to return sample notes
    Note.getNotesByAuthor.mockResolvedValue(mockNotes);

    const result = await getMyNotes(mockRequest);

    // Assertions
    expect(Note.getNotesByAuthor).toHaveBeenCalledWith(mockRequest.user);
    expect(result).toEqual({
      message: "Notes returned successfully",
      notes: mockNotes,
    });
  });

  it("should throw an error if note retrieval fails", async () => {
    const mockError = new Error("Failed to retrieve notes");

    // Mock the getNotesByAuthor method to throw an error
    Note.getNotesByAuthor.mockRejectedValue(mockError);

    try {
      await getMyNotes(mockRequest);
    } catch (error) {
      expect(Note.getNotesByAuthor).toHaveBeenCalledWith(mockRequest.user);
      expect(error.message).toBe(
        "Error while retrieving notes: Failed to retrieve notes"
      );
    }
  });
});
