const Parse = require("parse/node");
const User = require("../../app/models/user");
const { deleteUser } = require("../../app/controllers/authController");
const errors = require("../../app/constants/errorMessages");

// Mock User model methods
jest.mock("../../app/models/user", () => ({
  getUserByUsername: jest.fn(),
  deleteUser: jest.fn(),
}));

describe("deleteUser", () => {
  const mockRequest = {
    params: {
      username: "testUser",
    },
    master: true, // Master key provided
  };

  afterEach(() => {
    jest.clearAllMocks(); // Reset mocks after each test
  });

  it("should delete a user successfully", async () => {
    // Mock user retrieval
    const mockUser = { id: "userId", username: "testUser" };
    User.getUserByUsername.mockResolvedValue(mockUser);

    // Mock successful user deletion
    User.deleteUser.mockResolvedValue();

    const result = await deleteUser(mockRequest);

    // Assertions
    expect(User.getUserByUsername).toHaveBeenCalledWith("testUser");
    expect(User.deleteUser).toHaveBeenCalledWith(mockUser);
    expect(result).toEqual({ message: "User testUser deleted successfully." });
  });

  it("should throw an error if the user is not found", async () => {
    // Mock user retrieval to return null (user not found)
    User.getUserByUsername.mockResolvedValue(null);

    await expect(deleteUser(mockRequest)).rejects.toThrowError(
      new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, errors.USER_NOT_FOUND)
    );
  });

  it("should throw an error if no master key is provided", async () => {
    const requestWithoutMasterKey = {
      ...mockRequest,
      master: undefined, // No master key
    };

    await expect(deleteUser(requestWithoutMasterKey)).rejects.toThrowError(
      new Parse.Error(
        Parse.Error.OPERATION_FORBIDDEN,
        errors.MASTER_KEY_REQUIRED
      )
    );
  });

  it("should throw an error if deletion fails", async () => {
    // Mock user retrieval
    const mockUser = { id: "userId", username: "testUser" };
    User.getUserByUsername.mockResolvedValue(mockUser);

    // Mock user deletion failure
    User.deleteUser.mockRejectedValue(new Error("Deletion failed"));

    await expect(deleteUser(mockRequest)).rejects.toThrowError(
      new Parse.Error(
        Parse.Error.INTERNAL_SERVER_ERROR,
        "Error deleting user: Deletion failed"
      )
    );
  });
});
