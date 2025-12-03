import { randomUUID } from "node:crypto";
import { User } from "src/domain/aggregates/user";
import { UserRepository } from "src/domain/repositories/user_repository";
import { EmailAddress } from "src/domain/value_objects/email_address";
import { UserID } from "src/domain/value_objects/user_id";

export class InMemoryUserRepository implements UserRepository {
  private users: User[] = [];

  public async userOfEmail(emailAddress: EmailAddress): Promise<User | null> {
    const user = this.users.find(
      (user) => user.emailAddress.value === emailAddress.value,
    );
    return Promise.resolve(user || null);
  }

  public async existsByEmail(emailAddress: EmailAddress): Promise<boolean> {
    const exists = this.users.some(
      (user) => user.emailAddress.value === emailAddress.value,
    );
    return Promise.resolve(exists);
  }

  public async save(user: User): Promise<void> {
    const existingUserIndex = this.users.findIndex(
      (u) => u.id.value === user.id.value,
    );
    if (existingUserIndex !== -1) {
      this.users.splice(existingUserIndex, 1);
    }
    this.users.push(user);
  }

  public async nextIdentity(): Promise<UserID> {
    const id = `user_${randomUUID()}`;
    return Promise.resolve(new UserID(id));
  }
}
