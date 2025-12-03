import { TokenHasher } from "src/domain/ports/token_hasher";
import * as bcrypt from "bcrypt";

export class BcryptTokenHasher implements TokenHasher {
  private static SALT_ROUNDS = 10;

  public async hash(token: string): Promise<string> {
    return new Promise((resolve, reject) => {
      bcrypt.genSalt(BcryptTokenHasher.SALT_ROUNDS, function (err, salt) {
        if (err) {
          return reject(err);
        }

        bcrypt.hash(token, salt, function (err, hash) {
          if (err) {
            return reject(err);
          }
          return resolve(hash);
        });
      });
    });
  }
}
