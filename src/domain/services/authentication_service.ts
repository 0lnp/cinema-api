import { type PasswordHasher } from "../ports/password_hasher";
import { type TokenGenerator } from "../ports/token_generator";
import { type UserRepository } from "../repositories/user_repository";
import { User } from "../aggregates/user";
import { Role, RoleName } from "../value_objects/role";
import { SystemRoles } from "../value_objects/system_roles";
import { RoleAssignment } from "../value_objects/role_assignment";
import { EmailAddress } from "../value_objects/email_address";
import { TokenHasher } from "../ports/token_hasher";
import { RefreshTokenRepository } from "../repositories/refresh_token_repository";
import { RefreshToken } from "../aggregates/refresh_token";
import {
  InvariantError,
  InvariantErrorCode,
} from "src/shared/exceptions/invariant_error";

interface AuthenticateResult {
  user: User;
  accessToken: string;
  refreshToken: RefreshToken;
  rawRefreshToken: string;
}

export class AuthenticationService {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenGenerator: TokenGenerator,
    private readonly tokenHasher: TokenHasher,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  public async register(
    displayName: string,
    emailAddress: EmailAddress,
    plainPassword: string,
  ): Promise<User> {
    const emailExists = await this.userRepository.existsByEmail(emailAddress);
    if (emailExists) {
      throw new InvariantError({
        code: InvariantErrorCode.EMAIL_ALREADY_EXISTS,
        message: "User with this email already exists",
      });
    }

    const userID = await this.userRepository.nextIdentity();
    const hashedPassword = await this.passwordHasher.hash(plainPassword);
    const roleName = RoleName.CUSTOMER;
    const rolePermissions = SystemRoles.rolePermissions(roleName);
    const role = new Role(roleName, rolePermissions);
    const now = new Date();
    const roleAssignment = new RoleAssignment(role, now, "system");

    const user = User.register({
      id: userID,
      displayName,
      emailAddress,
      hashedPassword,
      roleAssignment,
    });

    return user;
  }

  public async authenticate(
    emailAddress: EmailAddress,
    plainPassword: string,
  ): Promise<AuthenticateResult | null> {
    const user = await this.userRepository.userOfEmail(emailAddress);
    if (user === null) {
      return null;
    }

    const passwordValid = await this.passwordHasher.compare(
      plainPassword,
      user.hashedPassword,
    );
    if (!passwordValid) {
      return null;
    }

    const refreshTokenExists = await this.refreshTokenRepository.existsByUserID(
      user.id,
    );
    if (refreshTokenExists) {
      await this.refreshTokenRepository.revokeToken(user.id);
    }

    const accessToken = await this.tokenGenerator.generate(
      { sub: user.id.value, role: user.roleAssignment.role.name },
      "access",
    );

    const rawRefreshToken = await this.tokenGenerator.generate(
      { sub: user.id.value },
      "refresh",
    );
    const hashedToken = await this.tokenHasher.hash(rawRefreshToken);
    const tokenID = await this.refreshTokenRepository.nextIdentity();
    const refreshToken = RefreshToken.issue({
      id: tokenID,
      userID: user.id,
      hashedToken,
    });

    user.recordSuccessfulAuthentication();

    return { user, accessToken, refreshToken, rawRefreshToken };
  }
}

export const AUTHENTICATION_SERVICE_TOKEN = Symbol.for("AuthenticationService");
