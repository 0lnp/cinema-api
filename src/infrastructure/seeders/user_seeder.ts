import { Inject, Injectable } from "@nestjs/common";
import { Seeder } from "./seeder";
import { UserRepository } from "src/domain/repositories/user_repository";
import { UserProfileRepository } from "src/domain/repositories/user_profile_repository";
import { PasswordHasher } from "src/domain/ports/password_hasher";
import { User } from "src/domain/aggregates/user";
import { Email } from "src/domain/value_objects/email";
import { RoleName } from "src/domain/value_objects/system_roles";
import { UserProfile } from "src/domain/entities/user_profile";

const DEMO_USERS = [
  {
    displayName: "Admin User",
    fullName: "Administrator",
    email: "admin@cinema.com",
    password: "Admin123!",
    role: RoleName.ADMIN,
  },
  {
    displayName: "John Doe",
    fullName: "John Doe",
    email: "john@example.com",
    password: "Customer123!",
    role: RoleName.CUSTOMER,
  },
  {
    displayName: "Jane Smith",
    fullName: "Jane Smith",
    email: "jane@example.com",
    password: "Customer123!",
    role: RoleName.CUSTOMER,
  },
  {
    displayName: "Bob Wilson",
    fullName: "Robert Wilson",
    email: "bob@example.com",
    password: "Customer123!",
    role: RoleName.CUSTOMER,
  },
];

@Injectable()
export class UserSeeder implements Seeder {
  public readonly name = "UserSeeder";
  public readonly order = 1;

  public constructor(
    @Inject(UserRepository.name)
    private readonly userRepository: UserRepository,
    @Inject(UserProfileRepository.name)
    private readonly userProfileRepository: UserProfileRepository,
    @Inject(PasswordHasher.name)
    private readonly passwordHasher: PasswordHasher,
  ) {}

  public async seed(): Promise<void> {
    for (const userData of DEMO_USERS) {
      const email = Email.create(userData.email);
      const exists = await this.userRepository.existsByEmail(email);

      if (exists) {
        console.log(`\t - Skipping ${userData.email} (already exists)`);
        continue;
      }

      const userID = await this.userRepository.nextIdentity();
      const passwordHash = await this.passwordHasher.hash(userData.password);

      const user = new User({
        id: userID,
        displayName: userData.displayName,
        email: email,
        passwordHash: passwordHash,
        roleName: userData.role,
        lastLoginAt: null,
        registeredAt: new Date(),
      });

      await this.userRepository.save(user);

      const profile = UserProfile.create({
        userId: userID,
        fullName: userData.fullName,
        phoneNumber: null,
        address: null,
      });

      await this.userProfileRepository.save(profile);

      console.log(`\t - Created user: ${userData.email} (${userData.role})`);
    }
  }
}
