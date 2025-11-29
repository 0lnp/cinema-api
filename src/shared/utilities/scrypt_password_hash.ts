import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

export class ScryptPasswordHash {
  public static readonly ALGORITHM = "scrypt";
  public static readonly SCRIPT_CONFIG = {
    keylen: 64,
    N: Math.pow(2, 17),
    r: 8,
    p: 1,
    get maxmem() {
      return 128 * this.N * this.r + 1024 * 1024;
    },
  };

  public static hash(plainText: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const salt = randomBytes(32);
      const { keylen, N, r, p, maxmem } = this.SCRIPT_CONFIG;

      scrypt(
        plainText,
        salt,
        keylen,
        { N, r, p, maxmem },
        (err, derivedKey) => {
          if (err) reject(err);

          // PHC-like format: $algorithm$N$r$p$salt$hash
          const hash = `$${this.ALGORITHM}$${N}$${r}$${p}$${salt.toString("hex")}$${derivedKey.toString("hex")}`;
          resolve(hash);
        },
      );
    });
  }

  public static verify(
    plainText: string,
    storedHash: string,
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const parts = storedHash.split("$").filter(Boolean);
      const [_, N, r, p, saltHex, hashHex] = parts;

      if (!N || !r || !p || !saltHex || !hashHex)
        throw new Error("Invalid stored hash");

      const salt = Buffer.from(saltHex, "hex");
      const storedHashBuffer = Buffer.from(hashHex, "hex");
      const { keylen, maxmem } = this.SCRIPT_CONFIG;

      scrypt(
        plainText,
        salt,
        keylen,
        { N: parseInt(N), r: parseInt(r), p: parseInt(p), maxmem },
        (err, derivedKey) => {
          if (err) reject(err);
          resolve(timingSafeEqual(storedHashBuffer, derivedKey));
        },
      );
    });
  }
}
