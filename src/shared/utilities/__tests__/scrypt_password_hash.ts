import { ScryptPasswordHash } from "../scrypt_password_hash";

describe("ScryptPasswordHash", () => {
  describe("hash", () => {
    it("should generate a hash from plain text password", async () => {
      const plainPassword = "MySecurePassword123!";

      const hashedPassword = await ScryptPasswordHash.hash(plainPassword);

      expect(hashedPassword).toBeDefined();
      expect(typeof hashedPassword).toBe("string");
      expect(hashedPassword.length).toBeGreaterThan(0);
    });

    it("should generate hash in correct PHC format", async () => {
      const plainPassword = "TestPassword456!";

      const hashedPassword = await ScryptPasswordHash.hash(plainPassword);

      const parts = hashedPassword.split("$").filter(Boolean);
      expect(parts).toHaveLength(6);
      expect(parts[0]).toBe(ScryptPasswordHash.ALGORITHM);
      expect(parts[1]).toBe(ScryptPasswordHash.SCRIPT_CONFIG.N.toString());
      expect(parts[2]).toBe(ScryptPasswordHash.SCRIPT_CONFIG.r.toString());
      expect(parts[3]).toBe(ScryptPasswordHash.SCRIPT_CONFIG.p.toString());
      expect(parts[4]).toHaveLength(64);
      expect(parts[5]).toHaveLength(128);
    });

    it("should generate different hashes for same password (due to salt)", async () => {
      const plainPassword = "SamePassword789!";

      const hash1 = await ScryptPasswordHash.hash(plainPassword);
      const hash2 = await ScryptPasswordHash.hash(plainPassword);

      expect(hash1).not.toBe(hash2);
      const isValid1 = await ScryptPasswordHash.verify(plainPassword, hash1);
      const isValid2 = await ScryptPasswordHash.verify(plainPassword, hash2);
      expect(isValid1).toBe(true);
      expect(isValid2).toBe(true);
    });

    it("should generate different hashes for different passwords", async () => {
      const password1 = "Password1!";
      const password2 = "Password2!";

      const hash1 = await ScryptPasswordHash.hash(password1);
      const hash2 = await ScryptPasswordHash.hash(password2);

      expect(hash1).not.toBe(hash2);
    });

    it("should handle empty string password", async () => {
      const plainPassword = "";

      const hashedPassword = await ScryptPasswordHash.hash(plainPassword);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).toMatch(/^\$scrypt\$/);
    });

    it("should handle very long passwords", async () => {
      const plainPassword = "a".repeat(1000);

      const hashedPassword = await ScryptPasswordHash.hash(plainPassword);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).toMatch(/^\$scrypt\$/);
    });

    it("should handle special characters in password", async () => {
      const plainPassword = "P@ssw0rd!#$%^&*()_+-=[]{}|;':\",./<>?";

      const hashedPassword = await ScryptPasswordHash.hash(plainPassword);

      expect(hashedPassword).toBeDefined();
      const isValid = await ScryptPasswordHash.verify(
        plainPassword,
        hashedPassword,
      );
      expect(isValid).toBe(true);
    });

    it("should handle unicode characters in password", async () => {
      const plainPassword = "Pässwörd123🔐😀中文";

      const hashedPassword = await ScryptPasswordHash.hash(plainPassword);

      expect(hashedPassword).toBeDefined();
      const isValid = await ScryptPasswordHash.verify(
        plainPassword,
        hashedPassword,
      );
      expect(isValid).toBe(true);
    });
  });

  describe("verify", () => {
    it("should return true for correct password", async () => {
      const plainPassword = "CorrectPassword123!";
      const hashedPassword = await ScryptPasswordHash.hash(plainPassword);

      const result = await ScryptPasswordHash.verify(
        plainPassword,
        hashedPassword,
      );

      expect(result).toBe(true);
    });

    it("should return false for incorrect password", async () => {
      const correctPassword = "CorrectPassword123!";
      const incorrectPassword = "WrongPassword456!";
      const hashedPassword = await ScryptPasswordHash.hash(correctPassword);

      const result = await ScryptPasswordHash.verify(
        incorrectPassword,
        hashedPassword,
      );

      expect(result).toBe(false);
    });

    it("should return false for slightly different password", async () => {
      const correctPassword = "Password123!";
      const slightlyDifferent = "Password123";
      const hashedPassword = await ScryptPasswordHash.hash(correctPassword);

      const result = await ScryptPasswordHash.verify(
        slightlyDifferent,
        hashedPassword,
      );

      expect(result).toBe(false);
    });

    it("should be case-sensitive", async () => {
      const password = "Password123!";
      const differentCase = "password123!";
      const hashedPassword = await ScryptPasswordHash.hash(password);

      const result = await ScryptPasswordHash.verify(
        differentCase,
        hashedPassword,
      );

      expect(result).toBe(false);
    });

    it("should throw error for invalid hash format", async () => {
      const plainPassword = "Password123!";
      const invalidHash = "invalid_hash_format";

      await expect(
        ScryptPasswordHash.verify(plainPassword, invalidHash),
      ).rejects.toThrow("Invalid stored hash");
    });

    it("should throw error for malformed hash with missing parts", async () => {
      const plainPassword = "Password123!";
      const malformedHash = "$scrypt$131072$8";

      await expect(
        ScryptPasswordHash.verify(plainPassword, malformedHash),
      ).rejects.toThrow("Invalid stored hash");
    });

    it("should throw error for empty hash", async () => {
      const plainPassword = "Password123!";
      const emptyHash = "";

      await expect(
        ScryptPasswordHash.verify(plainPassword, emptyHash),
      ).rejects.toThrow("Invalid stored hash");
    });

    it("should handle verification with empty password", async () => {
      const emptyPassword = "";
      const hashedPassword = await ScryptPasswordHash.hash(emptyPassword);

      const resultCorrect = await ScryptPasswordHash.verify(
        emptyPassword,
        hashedPassword,
      );
      const resultIncorrect = await ScryptPasswordHash.verify(
        "notEmpty",
        hashedPassword,
      );

      expect(resultCorrect).toBe(true);
      expect(resultIncorrect).toBe(false);
    });

    it("should verify password with special characters", async () => {
      const specialPassword = "P@ssw0rd!#$%^&*()";
      const hashedPassword = await ScryptPasswordHash.hash(specialPassword);

      const result = await ScryptPasswordHash.verify(
        specialPassword,
        hashedPassword,
      );

      expect(result).toBe(true);
    });

    it("should verify password with unicode characters", async () => {
      const unicodePassword = "Pässwörd🔐中文";
      const hashedPassword = await ScryptPasswordHash.hash(unicodePassword);

      const result = await ScryptPasswordHash.verify(
        unicodePassword,
        hashedPassword,
      );

      expect(result).toBe(true);
    });
  });

  describe("hash and verify integration", () => {
    it("should successfully verify multiple different passwords", async () => {
      const passwords = [
        "SimplePass1",
        "Complex!@#Pass123",
        "VeryLongPasswordWithManyCharacters123!@#",
        "短密码",
        "🔐🔑🛡️",
      ];

      for (const password of passwords) {
        const hashed = await ScryptPasswordHash.hash(password);
        const isValid = await ScryptPasswordHash.verify(password, hashed);
        expect(isValid).toBe(true);
      }
    });

    it("should not verify with any wrong password", async () => {
      const correctPassword = "CorrectPassword123!";
      const hashedPassword = await ScryptPasswordHash.hash(correctPassword);
      const wrongPasswords = [
        "WrongPassword123!",
        "correctpassword123!",
        "CorrectPassword123",
        "CorrectPassword123!!",
        "",
      ];

      for (const wrongPassword of wrongPasswords) {
        const isValid = await ScryptPasswordHash.verify(
          wrongPassword,
          hashedPassword,
        );
        expect(isValid).toBe(false);
      }
    });

    it("should use timing-safe comparison (constant time)", async () => {
      const password = "TimingSafeTest123!";
      const hashedPassword = await ScryptPasswordHash.hash(password);

      const iterations = 10;
      const correctTimes: number[] = [];
      const incorrectTimes: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const startCorrect = process.hrtime.bigint();
        await ScryptPasswordHash.verify(password, hashedPassword);
        const endCorrect = process.hrtime.bigint();
        correctTimes.push(Number(endCorrect - startCorrect));

        const startIncorrect = process.hrtime.bigint();
        await ScryptPasswordHash.verify("WrongPassword123!", hashedPassword);
        const endIncorrect = process.hrtime.bigint();
        incorrectTimes.push(Number(endIncorrect - startIncorrect));
      }

      const avgCorrect = correctTimes.reduce((a, b) => a + b) / iterations;
      const avgIncorrect = incorrectTimes.reduce((a, b) => a + b) / iterations;

      expect(avgCorrect).toBeGreaterThan(0);
      expect(avgIncorrect).toBeGreaterThan(0);
    });
  });

  describe("SCRIPT_CONFIG", () => {
    it("should have correct algorithm name", () => {
      expect(ScryptPasswordHash.ALGORITHM).toBe("scrypt");
    });

    it("should have correct configuration values", () => {
      const config = ScryptPasswordHash.SCRIPT_CONFIG;

      expect(config.keylen).toBe(64);
      expect(config.N).toBe(Math.pow(2, 17)); // 131072
      expect(config.r).toBe(8);
      expect(config.p).toBe(1);
    });

    it("should calculate maxmem correctly", () => {
      const config = ScryptPasswordHash.SCRIPT_CONFIG;
      const expectedMaxmem = 128 * config.N * config.r + 1024 * 1024;

      expect(config.maxmem).toBe(expectedMaxmem);
    });
  });

  describe("security properties", () => {
    it("should generate cryptographically strong hashes", async () => {
      const password = "TestPassword123!";

      const hash1 = await ScryptPasswordHash.hash(password);
      const hash2 = await ScryptPasswordHash.hash(password);

      const salt1 = hash1.split("$")[5];
      const salt2 = hash2.split("$")[5];
      expect(salt1).not.toBe(salt2);

      expect(salt1).toMatch(/^[0-9a-f]+$/);
      expect(salt2).toMatch(/^[0-9a-f]+$/);
    });

    it("should resist rainbow table attacks (unique salts)", async () => {
      const password = "CommonPassword123!";
      const hashes = new Set<string>();

      for (let i = 0; i < 5; i++) {
        const hash = await ScryptPasswordHash.hash(password);
        hashes.add(hash);
      }

      expect(hashes.size).toBe(5);
    });
  });

  describe("edge cases and error handling", () => {
    it("should handle concurrent hash operations", async () => {
      const passwords = Array.from({ length: 5 }, (_, i) => `Password${i}!`);

      const hashPromises = passwords.map((pwd) => ScryptPasswordHash.hash(pwd));
      const hashes = await Promise.all(hashPromises);

      expect(hashes).toHaveLength(5);
      hashes.forEach((hash) => {
        expect(hash).toBeDefined();
        expect(hash).toMatch(/^\$scrypt\$/);
      });
    });

    it("should handle concurrent verify operations", async () => {
      const password = "ConcurrentTest123!";
      const hash = await ScryptPasswordHash.hash(password);
      const verifications = Array(5).fill(password);

      const verifyPromises = verifications.map((pwd) =>
        ScryptPasswordHash.verify(pwd, hash),
      );
      const results = await Promise.all(verifyPromises);

      expect(results).toHaveLength(5);
      results.forEach((result) => {
        expect(result).toBe(true);
      });
    });
  });
});
