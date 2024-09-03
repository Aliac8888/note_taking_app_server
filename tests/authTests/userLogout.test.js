const Parse = require("parse/node");
const { userLogout } = require("../../app/controllers/authController");

describe("userLogout", () => {
  const mockRequest = {
    user: {
      getSessionToken: jest.fn().mockReturnValue("sessionToken123"),
    },
  };

  afterEach(() => {
    jest.clearAllMocks(); // Reset mocks after each test
  });

  it("should log out a user successfully when a session is found", async () => {
    const mockSession = {
      destroy: jest.fn().mockResolvedValue(),
    };

    // Mock session query to return a session
    const mockEqualTo = jest.fn();
    const mockFirst = jest.fn().mockResolvedValue(mockSession);

    Parse.Query = jest.fn(() => ({
      equalTo: mockEqualTo,
      first: mockFirst,
    }));

    const result = await userLogout(mockRequest);

    // Assertions
    expect(mockEqualTo).toHaveBeenCalledWith("sessionToken", "sessionToken123");
    expect(mockSession.destroy).toHaveBeenCalledWith({ useMasterKey: true });
    expect(result).toEqual({ message: "User logged out successfully" });
  });

  it("should log out a user successfully even if no session is found because user is logged in", async () => {
    // Mock session query to return null (no session found)
    const mockEqualTo = jest.fn();
    const mockFirst = jest.fn().mockResolvedValue(null);

    Parse.Query = jest.fn(() => ({
      equalTo: mockEqualTo,
      first: mockFirst,
    }));
    const result = await userLogout(mockRequest);

    // Assertions
    expect(mockEqualTo).toHaveBeenCalledWith("sessionToken", "sessionToken123");
    expect(result).toEqual({ message: "User logged out successfully" });
  });

  it("should throw an error if logout fails", async () => {
    // Mock session query to throw an error
    const mockFirst = jest.fn().mockRejectedValue(new Error("Logout failed"));

    Parse.Query = jest.fn(() => ({
      equalTo: jest.fn(),
      first: mockFirst,
    }));

    try {
      await userLogout(mockRequest);
    } catch (error) {
      expect(error.message).toBe("Error logging out user: Logout failed");
    }
  });
});
