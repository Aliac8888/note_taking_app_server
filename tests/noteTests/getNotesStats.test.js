const Parse = require("parse/node");
const { getNotesStats } = require("../../app/controllers/noteController");

// Mock Parse methods
jest.mock("parse/node", () => {
  const actualParse = jest.requireActual("parse/node");
  return {
    ...actualParse, // Preserve the original implementation of Parse
    Error: jest.fn().mockImplementation((code, message) => {
      return { code, message };
    }),
    Query: jest.fn().mockImplementation(() => ({
      aggregate: jest.fn(),
    })),
  };
});

describe("getNotesStats", () => {
  afterEach(() => {
    jest.clearAllMocks(); // Reset mocks after each test
  });

  it("should fetch stats successfully", async () => {
    const mockStats = [
      { _id: "author1", count: 5 },
      { _id: "author2", count: 3 },
    ];

    // Mock the aggregate method to return sample stats
    const mockAggregate = jest.fn().mockResolvedValue(mockStats);
    Parse.Query.mockImplementation(() => ({
      aggregate: mockAggregate,
    }));

    const result = await getNotesStats();

    // Assertions
    expect(mockAggregate).toHaveBeenCalledWith([
      {
        $group: {
          _id: "$author",
          count: { $sum: 1 },
        },
      },
    ]);
    expect(result).toEqual({
      message: "Fetched stats successfully",
      stats: mockStats,
    });
  });

  it("should throw an error if fetching stats fails", async () => {
    // Mock the aggregate method to throw an error
    const mockAggregate = jest.fn().mockRejectedValue(new Error("Stats fetch failed"));
    Parse.Query.mockImplementation(() => ({
      aggregate: mockAggregate,
    }));

    try {
      await getNotesStats();
      throw new Error(
        "Expected getNotesStats to throw an error, but it resolved."
      );
    } catch (error) {
      // This block should run when the promise is rejected
      expect(error.message).toBe("Error fetching stats: Stats fetch failed");
    }
  });
});
