const Parse = require("parse/node");
const { userLogin } = require("../../app/controllers/authController");

// Mock Parse methods
jest.mock("parse/node", () => {
  return {
    Error: jest.fn().mockImplementation((code, message) => {
      return { code, message };
    }),
    User: {
      logIn: jest.fn(),
    },
  };
});

describe("userLogin", () => {
  const mockRequest = {
    params: {
      username: "testUser",
      password: "testPass",
    },
  };

  afterEach(() => {
    jest.clearAllMocks(); // Reset mocks after each test
  });

  it("should log in a user successfully", async () => {
    // Mock successful login
    const mockUser = {
      getSessionToken: jest.fn().mockReturnValue("sessionToken123"),
    };
    Parse.User.logIn.mockResolvedValue(mockUser);

    const result = await userLogin(mockRequest);

    // Assertions
    expect(Parse.User.logIn).toHaveBeenCalledWith(
      mockRequest.params.username,
      mockRequest.params.password
    );
    expect(result).toEqual({
      message: "User logged in successfully",
      sessionToken: "sessionToken123",
    });
  });

  it("should throw an error if login fails", async () => {
    // Mock login failure
    Parse.User.logIn.mockRejectedValue(new Error("Login failed"));

    await userLogin(mockRequest).catch((error) => {
      expect(error.message).toBe("Error logging in user: Login failed");
    });
  });
});
