import {
  JoseTokenManager,
  TokenType,
  type TokenGeneratePayload,
} from "../jose_token_manager";
import { UserID } from "src/domain/value_objects/user_id";
import { RoleName } from "src/domain/value_objects/role";
import { jwtVerify } from "jose";
import { type JWTClaims } from "src/shared/types/jwt_claims";

describe("JoseTokenManager", () => {
  const JWT_EXPIRATION_TIME = "1h";
  const ACCESS_TOKEN_SECRET = "test-access-secret-key-123456";
  const REFRESH_TOKEN_SECRET = "test-refresh-secret-key-789012";

  let tokenManager: JoseTokenManager;
  let mockPayload: TokenGeneratePayload;

  beforeEach(() => {
    tokenManager = new JoseTokenManager(
      JWT_EXPIRATION_TIME,
      ACCESS_TOKEN_SECRET,
      REFRESH_TOKEN_SECRET,
    );

    mockPayload = {
      sub: new UserID("user_12345"),
      role: RoleName.CUSTOMER,
    };
  });

  describe("constructor", () => {
    it("should create an instance with valid parameters", () => {
      expect(tokenManager).toBeDefined();
      expect(tokenManager).toBeInstanceOf(JoseTokenManager);
    });

    it("should throw error when JWT_EXPIRATION_TIME is empty", () => {
      expect(() => {
        new JoseTokenManager("", ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET);
      }).toThrow("JWT expiration time is required");
    });

    it("should throw error when ACCESS_TOKEN_SECRET is empty", () => {
      expect(() => {
        new JoseTokenManager(JWT_EXPIRATION_TIME, "", REFRESH_TOKEN_SECRET);
      }).toThrow("JWT secret is required");
    });

    it("should throw error when REFRESH_TOKEN_SECRET is empty", () => {
      expect(() => {
        new JoseTokenManager(JWT_EXPIRATION_TIME, ACCESS_TOKEN_SECRET, "");
      }).toThrow("JWT secret is required");
    });

    it("should throw error when all parameters are empty", () => {
      expect(() => {
        new JoseTokenManager("", "", "");
      }).toThrow("JWT expiration time is required");
    });

    it("should accept different expiration time formats", () => {
      const manager1 = new JoseTokenManager(
        "2h",
        ACCESS_TOKEN_SECRET,
        REFRESH_TOKEN_SECRET,
      );
      const manager2 = new JoseTokenManager(
        "30m",
        ACCESS_TOKEN_SECRET,
        REFRESH_TOKEN_SECRET,
      );
      const manager3 = new JoseTokenManager(
        "7d",
        ACCESS_TOKEN_SECRET,
        REFRESH_TOKEN_SECRET,
      );

      expect(manager1).toBeDefined();
      expect(manager2).toBeDefined();
      expect(manager3).toBeDefined();
    });
  });

  describe("generate", () => {
    describe("access token generation", () => {
      it("should generate a valid access token", async () => {
        const token = await tokenManager.generate(
          mockPayload,
          TokenType.ACCESS,
        );

        expect(token).toBeDefined();
        expect(typeof token).toBe("string");
        expect(token.split(".")).toHaveLength(3);
      });

      it("should generate token with correct structure", async () => {
        const token = await tokenManager.generate(
          mockPayload,
          TokenType.ACCESS,
        );

        const parts = token.split(".");
        expect(parts).toHaveLength(3);

        parts.forEach((part) => {
          expect(part).toMatch(/^[A-Za-z0-9_-]+$/);
        });
      });

      it("should include subject (sub) from UserID in token", async () => {
        const token = await tokenManager.generate(
          mockPayload,
          TokenType.ACCESS,
        );

        const secret = new TextEncoder().encode(ACCESS_TOKEN_SECRET);
        const { payload } = await jwtVerify(token, secret);
        expect(payload.sub).toBe(mockPayload.sub.value);
      });

      it("should include role in token payload", async () => {
        const token = await tokenManager.generate(
          mockPayload,
          TokenType.ACCESS,
        );

        const secret = new TextEncoder().encode(ACCESS_TOKEN_SECRET);
        const { payload } = (await jwtVerify(token, secret)) as {
          payload: JWTClaims;
        };
        expect(payload.role).toBe(mockPayload.role);
      });

      it("should include iat (issued at) claim", async () => {
        const beforeGeneration = Math.floor(Date.now() / 1000);
        const token = await tokenManager.generate(
          mockPayload,
          TokenType.ACCESS,
        );
        const afterGeneration = Math.floor(Date.now() / 1000);

        const secret = new TextEncoder().encode(ACCESS_TOKEN_SECRET);
        const { payload } = await jwtVerify(token, secret);
        expect(payload.iat).toBeDefined();
        expect(payload.iat).toBeGreaterThanOrEqual(beforeGeneration);
        expect(payload.iat).toBeLessThanOrEqual(afterGeneration);
      });

      it("should include exp (expiration) claim", async () => {
        const token = await tokenManager.generate(
          mockPayload,
          TokenType.ACCESS,
        );

        const secret = new TextEncoder().encode(ACCESS_TOKEN_SECRET);
        const { payload } = await jwtVerify(token, secret);
        expect(payload.exp).toBeDefined();
        expect(payload.exp).toBeGreaterThan(payload.iat!);
      });

      it("should use HS256 algorithm", async () => {
        const token = await tokenManager.generate(
          mockPayload,
          TokenType.ACCESS,
        );

        const secret = new TextEncoder().encode(ACCESS_TOKEN_SECRET);
        const { protectedHeader } = await jwtVerify(token, secret);
        expect(protectedHeader.alg).toBe("HS256");
      });

      it("should generate different tokens for same payload (due to iat)", async () => {
        const token1 = await tokenManager.generate(
          mockPayload,
          TokenType.ACCESS,
        );

        await new Promise((resolve) => setTimeout(resolve, 1000));

        const token2 = await tokenManager.generate(
          mockPayload,
          TokenType.ACCESS,
        );

        expect(token1).not.toBe(token2);
      });

      it("should handle different user IDs", async () => {
        const payload1 = { ...mockPayload, sub: new UserID("user_11111") };
        const payload2 = { ...mockPayload, sub: new UserID("user_22222") };

        const token1 = await tokenManager.generate(payload1, TokenType.ACCESS);
        const token2 = await tokenManager.generate(payload2, TokenType.ACCESS);

        expect(token1).not.toBe(token2);

        const secret = new TextEncoder().encode(ACCESS_TOKEN_SECRET);
        const { payload: decoded1 } = await jwtVerify(token1, secret);
        const { payload: decoded2 } = await jwtVerify(token2, secret);

        expect(decoded1.sub).toBe("user_11111");
        expect(decoded2.sub).toBe("user_22222");
      });

      it("should handle different roles", async () => {
        const customerPayload = { ...mockPayload, role: RoleName.CUSTOMER };
        const adminPayload = { ...mockPayload, role: RoleName.ADMIN };

        const customerToken = await tokenManager.generate(
          customerPayload,
          TokenType.ACCESS,
        );
        const adminToken = await tokenManager.generate(
          adminPayload,
          TokenType.ACCESS,
        );

        const secret = new TextEncoder().encode(ACCESS_TOKEN_SECRET);
        const { payload: customerDecoded } = (await jwtVerify(
          customerToken,
          secret,
        )) as { payload: JWTClaims };
        const { payload: adminDecoded } = (await jwtVerify(
          adminToken,
          secret,
        )) as { payload: JWTClaims };

        expect(customerDecoded.role).toBe(RoleName.CUSTOMER);
        expect(adminDecoded.role).toBe(RoleName.ADMIN);
      });
    });

    describe("refresh token generation", () => {
      it("should generate a valid refresh token", async () => {
        const token = await tokenManager.generate(
          mockPayload,
          TokenType.REFRESH,
        );

        expect(token).toBeDefined();
        expect(typeof token).toBe("string");
        expect(token.split(".")).toHaveLength(3);
      });

      it("should use different secret for refresh token", async () => {
        const refreshToken = await tokenManager.generate(
          mockPayload,
          TokenType.REFRESH,
        );

        const refreshSecret = new TextEncoder().encode(REFRESH_TOKEN_SECRET);
        const { payload } = await jwtVerify(refreshToken, refreshSecret);
        expect(payload.sub).toBe(mockPayload.sub.value);

        const accessSecret = new TextEncoder().encode(ACCESS_TOKEN_SECRET);
        await expect(jwtVerify(refreshToken, accessSecret)).rejects.toThrow();
      });

      it("should generate different access and refresh tokens for same payload", async () => {
        const accessToken = await tokenManager.generate(
          mockPayload,
          TokenType.ACCESS,
        );
        const refreshToken = await tokenManager.generate(
          mockPayload,
          TokenType.REFRESH,
        );

        expect(accessToken).not.toBe(refreshToken);
      });
    });

    describe("token payload handling", () => {
      it("should not include sub object, only sub.value", async () => {
        const token = await tokenManager.generate(
          mockPayload,
          TokenType.ACCESS,
        );

        const secret = new TextEncoder().encode(ACCESS_TOKEN_SECRET);
        const { payload } = await jwtVerify(token, secret);

        expect(typeof payload.sub).toBe("string");
        expect(payload.sub).toBe(mockPayload.sub.value);
      });

      it("should include all payload properties except sub object", async () => {
        const token = await tokenManager.generate(
          mockPayload,
          TokenType.ACCESS,
        );

        const secret = new TextEncoder().encode(ACCESS_TOKEN_SECRET);
        const { payload } = (await jwtVerify(token, secret)) as {
          payload: JWTClaims;
        };

        expect(payload.role).toBe(mockPayload.role);
        expect(payload.sub).toBe(mockPayload.sub.value);
        expect(payload.iat).toBeDefined();
        expect(payload.exp).toBeDefined();
      });
    });
  });

  describe("verify", () => {
    describe("access token verification", () => {
      it("should verify a valid access token", async () => {
        const token = await tokenManager.generate(
          mockPayload,
          TokenType.ACCESS,
        );

        const claims = await tokenManager.verify(token, TokenType.ACCESS);

        expect(claims).toBeDefined();
        expect(claims.sub).toBeDefined();
        expect(claims.role).toBe(mockPayload.role);
      });

      it("should return correct claims from verified token", async () => {
        const token = await tokenManager.generate(
          mockPayload,
          TokenType.ACCESS,
        );

        const claims = await tokenManager.verify(token, TokenType.ACCESS);

        expect(claims.sub).toBeDefined();
        expect(claims.role).toBe(RoleName.CUSTOMER);
        expect(claims.iat).toBeDefined();
        expect(claims.exp).toBeDefined();
      });

      it("should throw error when verifying access token with wrong secret", async () => {
        const token = await tokenManager.generate(
          mockPayload,
          TokenType.ACCESS,
        );

        await expect(
          tokenManager.verify(token, TokenType.REFRESH),
        ).rejects.toThrow();
      });

      it("should throw error for malformed token", async () => {
        const malformedToken = "not.a.valid.jwt.token";

        await expect(
          tokenManager.verify(malformedToken, TokenType.ACCESS),
        ).rejects.toThrow();
      });

      it("should throw error for invalid signature", async () => {
        const token = await tokenManager.generate(
          mockPayload,
          TokenType.ACCESS,
        );
        const tamperedToken = token.slice(0, -10) + "tampered12";

        await expect(
          tokenManager.verify(tamperedToken, TokenType.ACCESS),
        ).rejects.toThrow();
      });

      it("should throw error for empty token", async () => {
        await expect(
          tokenManager.verify("", TokenType.ACCESS),
        ).rejects.toThrow();
      });

      it("should throw error for token with only dots", async () => {
        await expect(
          tokenManager.verify("..", TokenType.ACCESS),
        ).rejects.toThrow();
      });
    });

    describe("refresh token verification", () => {
      it("should verify a valid refresh token", async () => {
        const token = await tokenManager.generate(
          mockPayload,
          TokenType.REFRESH,
        );

        const claims = await tokenManager.verify(token, TokenType.REFRESH);

        expect(claims).toBeDefined();
        expect(claims.sub).toBeDefined();
        expect(claims.role).toBe(mockPayload.role);
      });

      it("should throw error when verifying refresh token with wrong secret", async () => {
        const token = await tokenManager.generate(
          mockPayload,
          TokenType.REFRESH,
        );

        await expect(
          tokenManager.verify(token, TokenType.ACCESS),
        ).rejects.toThrow();
      });
    });

    describe("token expiration", () => {
      it("should verify non-expired token", async () => {
        const shortLivedManager = new JoseTokenManager(
          "1h",
          ACCESS_TOKEN_SECRET,
          REFRESH_TOKEN_SECRET,
        );
        const token = await shortLivedManager.generate(
          mockPayload,
          TokenType.ACCESS,
        );

        await expect(
          shortLivedManager.verify(token, TokenType.ACCESS),
        ).resolves.toBeDefined();
      });

      it("should include expiration time in verified claims", async () => {
        const token = await tokenManager.generate(
          mockPayload,
          TokenType.ACCESS,
        );

        const claims = await tokenManager.verify(token, TokenType.ACCESS);

        expect(claims.exp).toBeDefined();
        expect(claims.exp).toBeGreaterThan(Date.now() / 1000);
      });
    });

    describe("security validations", () => {
      it("should reject tokens from different instances with different secrets", async () => {
        const otherManager = new JoseTokenManager(
          JWT_EXPIRATION_TIME,
          "different-access-secret",
          "different-refresh-secret",
        );
        const tokenFromOtherManager = await otherManager.generate(
          mockPayload,
          TokenType.ACCESS,
        );

        await expect(
          tokenManager.verify(tokenFromOtherManager, TokenType.ACCESS),
        ).rejects.toThrow();
      });

      it("should handle tokens with modified payload", async () => {
        const token = await tokenManager.generate(
          mockPayload,
          TokenType.ACCESS,
        );

        const parts = token.split(".");
        const modifiedPayload = Buffer.from(
          '{"sub":"hacked","role":"admin"}',
        ).toString("base64url");
        const tamperedToken = `${parts[0]}.${modifiedPayload}.${parts[2]}`;

        await expect(
          tokenManager.verify(tamperedToken, TokenType.ACCESS),
        ).rejects.toThrow();
      });
    });
  });

  describe("generate and verify integration", () => {
    it("should successfully round-trip access tokens", async () => {
      const token = await tokenManager.generate(mockPayload, TokenType.ACCESS);
      const claims = await tokenManager.verify(token, TokenType.ACCESS);

      expect(claims.role).toBe(mockPayload.role);
    });

    it("should successfully round-trip refresh tokens", async () => {
      const token = await tokenManager.generate(mockPayload, TokenType.REFRESH);
      const claims = await tokenManager.verify(token, TokenType.REFRESH);

      expect(claims.role).toBe(mockPayload.role);
    });

    it("should handle multiple tokens with different users", async () => {
      const users = [
        { sub: new UserID("user_1"), role: RoleName.CUSTOMER },
        { sub: new UserID("user_2"), role: RoleName.ADMIN },
        { sub: new UserID("user_3"), role: RoleName.CUSTOMER },
      ];

      const tokens = await Promise.all(
        users.map((user) => tokenManager.generate(user, TokenType.ACCESS)),
      );

      const verifiedClaims = await Promise.all(
        tokens.map((token) => tokenManager.verify(token, TokenType.ACCESS)),
      );

      verifiedClaims.forEach((claims, index) => {
        expect(claims.role).toBe(users[index]!.role);
      });
    });

    it("should handle concurrent token operations", async () => {
      const payloads = Array.from({ length: 10 }, (_, i) => ({
        sub: new UserID(`user_${i}`),
        role: i % 2 === 0 ? RoleName.CUSTOMER : RoleName.ADMIN,
      }));

      const generatePromises = payloads.map((payload) =>
        tokenManager.generate(payload, TokenType.ACCESS),
      );
      const tokens = await Promise.all(generatePromises);

      const verifyPromises = tokens.map((token) =>
        tokenManager.verify(token, TokenType.ACCESS),
      );
      const claims = await Promise.all(verifyPromises);

      expect(claims).toHaveLength(10);
      claims.forEach((claim, index) => {
        expect(claim.role).toBe(payloads[index]!.role);
      });
    });
  });

  describe("different expiration times", () => {
    it("should respect custom expiration time", async () => {
      const customManager = new JoseTokenManager(
        "2h",
        ACCESS_TOKEN_SECRET,
        REFRESH_TOKEN_SECRET,
      );

      const token = await customManager.generate(mockPayload, TokenType.ACCESS);
      const claims = await customManager.verify(token, TokenType.ACCESS);

      const twoHoursInSeconds = 2 * 60 * 60;

      expect(claims.exp).toBeDefined();
      expect(claims.exp - claims.iat).toBeGreaterThan(twoHoursInSeconds - 10);
      expect(claims.exp - claims.iat).toBeLessThan(twoHoursInSeconds + 10);
    });

    it("should handle different time formats", async () => {
      const managers = [
        new JoseTokenManager("30s", ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET),
        new JoseTokenManager("15m", ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET),
        new JoseTokenManager("7d", ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET),
      ];

      for (const manager of managers) {
        const token = await manager.generate(mockPayload, TokenType.ACCESS);
        const claims = await manager.verify(token, TokenType.ACCESS);

        expect(claims).toBeDefined();
        expect(claims.exp).toBeGreaterThan(claims.iat!);
      }
    });
  });
});
