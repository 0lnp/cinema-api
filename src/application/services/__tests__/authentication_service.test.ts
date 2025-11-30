import { AuthenticationService } from "../authentication_service";
import { type UserRepository } from "src/domain/repositories/user_repository";
import {
  type JoseTokenManager,
  TokenType,
} from "src/shared/utilities/jose_token_manager";
import { type AuthenticateCommand } from "../../types/authenticate";
import { User } from "src/domain/aggregates/user";
import { UserID } from "src/domain/value_objects/user_id";
import { RoleAssignment } from "src/domain/value_objects/role_assignment";
import { Role, RoleName } from "src/domain/value_objects/role";
import { SystemRoles } from "src/domain/value_objects/system_roles";
import { jest } from "@jest/globals";
import {
  ApplicationError,
  ApplicationErrorType,
} from "src/errors/application_error";

describe("AuthenticationService", () => {
  let authenticationService: AuthenticationService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockJwtTokenManager: jest.Mocked<JoseTokenManager>;

  const mockUserId = new UserID("user_12345");
  const mockEmail = "test@example.com";
  const mockPassword = "SecurePassword123!";
  const mockAccessToken = "mock.access.token";
  const mockRefreshToken = "mock.refresh.token";

  beforeEach(() => {
    mockUserRepository = {
      userOfEmail: jest.fn(),
    } as Partial<UserRepository> as jest.Mocked<UserRepository>;

    mockJwtTokenManager = {
      generate: jest.fn(),
      verify: jest.fn(),
    } as Partial<JoseTokenManager> as jest.Mocked<JoseTokenManager>;

    authenticationService = new AuthenticationService(
      mockUserRepository,
      mockJwtTokenManager,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("authenticate", () => {
    const createMockUser = (): User => {
      const rolePermissions = SystemRoles.rolePermissions(RoleName.CUSTOMER);
      const roleAssignment = new RoleAssignment(
        new Role(RoleName.CUSTOMER, rolePermissions),
        new Date(),
        "system",
      );

      return new User({
        id: mockUserId,
        displayName: "Test User",
        emailAddress: mockEmail,
        hashedPassword: "hashed_password_value",
        roleAssignment,
        lastLoginAt: null,
        loginAttempts: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    };

    const createAuthenticateCommand = (
      email: string = mockEmail,
      password: string = mockPassword,
    ): AuthenticateCommand => ({
      emailAddress: email,
      plainPassword: password,
    });

    describe("successful authentication", () => {
      it("should return access and refresh tokens when credentials are valid", async () => {
        const mockUser = createMockUser();
        const command = createAuthenticateCommand();

        mockUserRepository.userOfEmail.mockResolvedValue(mockUser);
        jest.spyOn(mockUser, "login").mockResolvedValue(true);
        mockJwtTokenManager.generate
          .mockResolvedValueOnce(mockAccessToken)
          .mockResolvedValueOnce(mockRefreshToken);

        const result = await authenticationService.authenticate(command);

        expect(result).toEqual({
          accessToken: mockAccessToken,
          refreshToken: mockRefreshToken,
        });
        expect(mockUserRepository.userOfEmail).toHaveBeenCalledTimes(1);
        expect(mockUserRepository.userOfEmail).toHaveBeenCalledWith(
          command.emailAddress,
        );
        expect(mockUser.login).toHaveBeenCalledTimes(1);
        expect(mockUser.login).toHaveBeenCalledWith(command.plainPassword);
      });

      it("should generate tokens with correct payload", async () => {
        const mockUser = createMockUser();
        const command = createAuthenticateCommand();

        mockUserRepository.userOfEmail.mockResolvedValue(mockUser);
        jest.spyOn(mockUser, "login").mockResolvedValue(true);
        mockJwtTokenManager.generate
          .mockResolvedValueOnce(mockAccessToken)
          .mockResolvedValueOnce(mockRefreshToken);

        await authenticationService.authenticate(command);

        const expectedPayload = {
          sub: mockUser.id,
          role: mockUser.roleAssignment.role.name,
        };

        expect(mockJwtTokenManager.generate).toHaveBeenCalledTimes(2);
        expect(mockJwtTokenManager.generate).toHaveBeenNthCalledWith(
          1,
          expectedPayload,
          TokenType.ACCESS,
        );
        expect(mockJwtTokenManager.generate).toHaveBeenNthCalledWith(
          2,
          expectedPayload,
          TokenType.REFRESH,
        );
      });

      it("should handle users with different roles", async () => {
        const adminRolePermissions = SystemRoles.rolePermissions(
          RoleName.ADMIN,
        );
        const adminRoleAssignment = new RoleAssignment(
          new Role(RoleName.ADMIN, adminRolePermissions),
          new Date(),
          "system",
        );

        const adminUser = new User({
          id: mockUserId,
          displayName: "Admin User",
          emailAddress: "admin@example.com",
          hashedPassword: "hashed_password",
          roleAssignment: adminRoleAssignment,
          lastLoginAt: null,
          loginAttempts: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const command = createAuthenticateCommand(
          "admin@example.com",
          mockPassword,
        );

        mockUserRepository.userOfEmail.mockResolvedValue(adminUser);
        jest.spyOn(adminUser, "login").mockResolvedValue(true);
        mockJwtTokenManager.generate
          .mockResolvedValueOnce(mockAccessToken)
          .mockResolvedValueOnce(mockRefreshToken);

        const result = await authenticationService.authenticate(command);

        expect(result).toBeDefined();
        expect(mockJwtTokenManager.generate).toHaveBeenCalledWith(
          expect.objectContaining({
            role: RoleName.ADMIN,
          }),
          expect.anything(),
        );
      });
    });

    describe("failed authentication - user not found", () => {
      it("should throw error for non-existent email", async () => {
        const command = createAuthenticateCommand(
          "nonexistent@example.com",
          mockPassword,
        );
        mockUserRepository.userOfEmail.mockResolvedValue(null);

        await expect(
          authenticationService.authenticate(command),
        ).rejects.toThrow(
          new ApplicationError({
            type: ApplicationErrorType.EMAIL_NOT_FOUND_ERROR,
            message: `No user registered with email: ${command.emailAddress}`,
          }),
        );
      });
    });

    describe("failed authentication - invalid password", () => {
      it("should throw error when password is invalid", async () => {
        const mockUser = createMockUser();
        const command = createAuthenticateCommand(
          mockEmail,
          "WrongPassword123!",
        );

        mockUserRepository.userOfEmail.mockResolvedValue(mockUser);
        jest.spyOn(mockUser, "login").mockResolvedValue(false);

        await expect(
          authenticationService.authenticate(command),
        ).rejects.toThrow(
          new ApplicationError({
            type: ApplicationErrorType.PASSWORD_INVALID_ERROR,
            message: `Invalid password for user ${mockUser.id.value}`,
          }),
        );
        expect(mockUserRepository.userOfEmail).toHaveBeenCalledTimes(1);
        expect(mockUser.login).toHaveBeenCalledTimes(1);
        expect(mockJwtTokenManager.generate).not.toHaveBeenCalled();
      });

      it("should not generate tokens when password verification fails", async () => {
        const mockUser = createMockUser();
        const command = createAuthenticateCommand();

        mockUserRepository.userOfEmail.mockResolvedValue(mockUser);
        jest.spyOn(mockUser, "login").mockResolvedValue(false);

        await expect(
          authenticationService.authenticate(command),
        ).rejects.toThrow();
        expect(mockJwtTokenManager.generate).not.toHaveBeenCalled();
      });
    });

    describe("edge cases", () => {
      it("should handle repository errors gracefully", async () => {
        const command = createAuthenticateCommand();
        const repositoryError = new Error("Database connection failed");
        mockUserRepository.userOfEmail.mockRejectedValue(repositoryError);

        await expect(
          authenticationService.authenticate(command),
        ).rejects.toThrow("Database connection failed");
        expect(mockJwtTokenManager.generate).not.toHaveBeenCalled();
      });

      it("should handle token generation errors", async () => {
        const mockUser = createMockUser();
        const command = createAuthenticateCommand();
        const tokenError = new Error("Token generation failed");

        mockUserRepository.userOfEmail.mockResolvedValue(mockUser);
        jest.spyOn(mockUser, "login").mockResolvedValue(true);
        mockJwtTokenManager.generate.mockRejectedValue(tokenError);

        await expect(
          authenticationService.authenticate(command),
        ).rejects.toThrow("Token generation failed");
        expect(mockJwtTokenManager.generate).toHaveBeenCalledTimes(1);
      });

      it("should handle token generation failure for refresh token", async () => {
        const mockUser = createMockUser();
        const command = createAuthenticateCommand();
        const tokenError = new Error("Refresh token generation failed");

        mockUserRepository.userOfEmail.mockResolvedValue(mockUser);
        jest.spyOn(mockUser, "login").mockResolvedValue(true);
        mockJwtTokenManager.generate
          .mockResolvedValueOnce(mockAccessToken)
          .mockRejectedValueOnce(tokenError);

        await expect(
          authenticationService.authenticate(command),
        ).rejects.toThrow("Refresh token generation failed");
        expect(mockJwtTokenManager.generate).toHaveBeenCalledTimes(2);
      });
    });
  });
});
