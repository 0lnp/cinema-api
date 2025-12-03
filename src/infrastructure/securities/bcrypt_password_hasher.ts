import * as bcrypt from "bcrypt";
import { PasswordHasher } from "src/domain/ports/password_hasher";

export class BcryptPasswordHasher implements PasswordHasher {
  private static SALT_ROUNDS = 10;

  public async hash(plainPassword: string): Promise<string> {
    return new Promise((resolve, reject) => {
      bcrypt.genSalt(BcryptPasswordHasher.SALT_ROUNDS, function (err, salt) {
        if (err) {
          return reject(err);
        }

        bcrypt.hash(plainPassword, salt, function (err, hash) {
          if (err) {
            return reject(err);
          }
          return resolve(hash);
        });
      });
    });
  }

  public async compare(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      bcrypt.compare(plainPassword, hashedPassword, function (err, result) {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      });
    });
  }
}
