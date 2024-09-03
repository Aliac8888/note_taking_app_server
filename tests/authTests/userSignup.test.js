const User = require("../../app/models/user");
const roleModel = require("../../app/models/role");
const errors = require("../../app/constants/errorMessages");
const { userSignup } = require("../../app/controllers/authController");

// Mock User and Role Models
jest.mock("../../app/models/user");
jest.mock("../../app/models/role");

// Mock Parse methods
jest.mock("parse/node", () => {
  return {
    Error: jest.fn().mockImplementation((code, message) => {
      return { code, message };
    }),
    User: jest.fn().mockImplementation(() => ({
      signUp: jest.fn(),
      set: jest.fn(),
    })),
    Query: jest.fn().mockImplementation(() => ({
      equalTo: jest.fn(),
      first: jest.fn(),
    })),
  };
});

describe("userSignup", () => {
  const mockRequest = {
    params: {
      username: "testUser",
      password: "testPass",
      email: "test@example.com",
      isAdmin: false,
    },
    master: true, // Optional, used for admin creation
  };

  afterEach(() => {
    jest.clearAllMocks(); // Reset mocks after each test
  });

  it("should sign up a user and assign roles", async () => {
    // Mock successful user creation
    User.createUser.mockResolvedValue({ id: "userId" });

    // Mock role assignment
    roleModel.assignUserRole.mockResolvedValue();
    roleModel.assignAdminRole.mockResolvedValue();

    const result = await userSignup(mockRequest);

    // Assertions
    expect(User.createUser).toHaveBeenCalledWith(
      mockRequest.params.username,
      mockRequest.params.password,
      mockRequest.params.email
    );
    expect(roleModel.assignUserRole).toHaveBeenCalledWith({ id: "userId" });
    expect(result).toEqual({ message: "User signed up successfully" });
  });

  it("should throw an error if trying to create an admin without master key", async () => {
    const adminRequest = {
      ...mockRequest,
      params: { ...mockRequest.params, isAdmin: true },
      master: undefined,
    };
    await userSignup(adminRequest).catch((error) => {
      expect(error.message).toBe(errors.MASTER_KEY_REQUIRED);
    });
  });

  it("should assign admin role if isAdmin is true and master key is provided", async () => {
    const adminRequest = {
      ...mockRequest,
      params: { ...mockRequest.params, isAdmin: true },
    };

    // Mock successful user creation
    User.createUser.mockResolvedValue({ id: "adminUserId" });

    // Mock role assignment
    roleModel.assignUserRole.mockResolvedValue();
    roleModel.assignAdminRole.mockResolvedValue();

    const result = await userSignup(adminRequest);

    expect(User.createUser).toHaveBeenCalledWith(
      adminRequest.params.username,
      adminRequest.params.password,
      adminRequest.params.email
    );
    expect(roleModel.assignUserRole).toHaveBeenCalledWith({
      id: "adminUserId",
    });
    expect(roleModel.assignAdminRole).toHaveBeenCalledWith({
      id: "adminUserId",
    });
    expect(result).toEqual({ message: "User signed up successfully" });
  });

  it("should throw an error if user signup fails", async () => {
    // Mock user creation failure
    User.createUser.mockRejectedValue(new Error("Signup failed"));

    await userSignup(mockRequest).catch((error) => {
      expect(error.message).toBe("Error signing up user: Signup failed");
    });
  });
});
