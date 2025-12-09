import { InjectRepository } from "@nestjs/typeorm";
import { RefreshToken, TokenStatus } from "src/domain/aggregates/refresh_token";
import { type RefreshTokenRepository } from "src/domain/repositories/refresh_token_repository";
import { TokenID } from "src/domain/value_objects/token_id";
import {
  InfrastructureError,
  InfrastructureErrorCode,
} from "src/shared/exceptions/infrastructure_error";
import { RefreshTokenORMEntity } from "../databases/orm_entities/refresh_token_orm_entity";
import { Repository } from "typeorm";
import { UserID } from "src/domain/value_objects/user_id";

export class TypeORMRefreshTokenRepository implements RefreshTokenRepository {
  public constructor(
    @InjectRepository(RefreshTokenORMEntity)
    private readonly ormRepository: Repository<RefreshTokenORMEntity>,
  ) {}

  public async save(token: RefreshToken): Promise<void> {
    const refreshTokenORMEntity = this.toPersistence(token);
    await this.ormRepository.save(refreshTokenORMEntity);
  }

  public async nextIdentity(): Promise<TokenID> {
    const maxAttempts = 3;
    let attempt = 0;

    while (attempt < maxAttempts) {
      const id = TokenID.generate();
      const exists = await this.ormRepository.existsBy({ id: id.value });

      if (!exists) {
        return id;
      }

      attempt++;
    }

    throw new InfrastructureError({
      code: InfrastructureErrorCode.ID_GENERATION_FAILED,
      message: `Failed to generate unique RefreshTokenID after ${maxAttempts} attempts`,
    });
  }

  public async nextFamily(): Promise<TokenID> {
    const maxAttempts = 3;
    let attempt = 0;

    while (attempt < maxAttempts) {
      const tokenFamily = TokenID.generate();
      const exists = await this.ormRepository.existsBy({
        tokenFamily: tokenFamily.value,
      });

      if (!exists) {
        return tokenFamily;
      }

      attempt++;
    }

    throw new InfrastructureError({
      code: InfrastructureErrorCode.ID_GENERATION_FAILED,
      message: `Failed to generate unique TokenFamily after ${maxAttempts} attempts`,
    });
  }

  public async tokenOfHash(hash: string): Promise<RefreshToken | null> {
    const token = await this.ormRepository.findOneBy({ tokenHash: hash });
    return token !== null ? this.toDomain(token) : null;
  }

  public async revokeByFamily(family: TokenID): Promise<void> {
    await this.ormRepository.delete({ tokenFamily: family.value });
  }

  private toDomain(token: RefreshTokenORMEntity): RefreshToken {
    return new RefreshToken({
      id: new TokenID(token.id),
      userID: new UserID(token.userID),
      tokenHash: token.tokenHash,
      tokenFamily: new TokenID(token.tokenFamily),
      status: token.status as TokenStatus,
      issuedAt: token.issuedAt,
      expiresAt: token.expiresAt,
    });
  }

  private toPersistence(refreshToken: RefreshToken): RefreshTokenORMEntity {
    return {
      id: refreshToken.id.value,
      userID: refreshToken.userID.value,
      tokenHash: refreshToken.tokenHash,
      tokenFamily: refreshToken.tokenFamily.value,
      issuedAt: refreshToken.issuedAt,
      expiresAt: refreshToken.expiresAt,
      status: refreshToken.status,
    };
  }
}
