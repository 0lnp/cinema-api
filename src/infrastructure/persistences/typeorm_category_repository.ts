import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { CategoryRepository } from "src/domain/repositories/category_repository";
import { Category } from "src/domain/aggregates/category";
import { CategoryID } from "src/domain/value_objects/category_id";
import { CategoryORMEntity } from "../databases/orm_entities/category_orm_entity";
import {
  InfrastructureError,
  InfrastructureErrorCode,
} from "src/shared/exceptions/infrastructure_error";

export class TypeormCategoryRepository implements CategoryRepository {
  public constructor(
    @InjectRepository(CategoryORMEntity)
    private readonly ormRepository: Repository<CategoryORMEntity>,
  ) {}

  public async categoryOfID(id: CategoryID): Promise<Category | null> {
    const entity = await this.ormRepository.findOneBy({ id: id.value });
    return entity !== null ? this.toDomain(entity) : null;
  }

  public async rootCategories(): Promise<Category[]> {
    const entities = await this.ormRepository.find({
      where: { parentId: IsNull() },
      order: { name: "ASC" },
    });
    return entities.map(this.toDomain);
  }

  public async childrenOf(parentId: CategoryID): Promise<Category[]> {
    const entities = await this.ormRepository.find({
      where: { parentId: parentId.value },
      order: { name: "ASC" },
    });
    return entities.map(this.toDomain);
  }

  public async allCategories(): Promise<Category[]> {
    const entities = await this.ormRepository.find({
      order: { path: "ASC" },
    });
    return entities.map(this.toDomain);
  }

  public async nextIdentity(): Promise<CategoryID> {
    const maxAttempts = 3;
    let attempt = 0;

    while (attempt < maxAttempts) {
      const id = CategoryID.generate();
      const exists = await this.ormRepository.existsBy({ id: id.value });

      if (!exists) {
        return id;
      }

      attempt++;
    }

    throw new InfrastructureError({
      code: InfrastructureErrorCode.ID_GENERATION_FAILED,
      message: `Failed to generate unique CategoryID after ${maxAttempts} attempts`,
    });
  }

  public async save(category: Category): Promise<void> {
    const entity = this.toPersistence(category);
    await this.ormRepository.save(entity);
  }

  private toDomain(entity: CategoryORMEntity): Category {
    return new Category({
      id: new CategoryID(entity.id),
      name: entity.name,
      parentId:
        entity.parentId !== null ? new CategoryID(entity.parentId) : null,
      path: entity.path,
      level: entity.level,
      createdAt: entity.createdAt,
    });
  }

  private toPersistence(category: Category): CategoryORMEntity {
    const entity = new CategoryORMEntity();
    entity.id = category.id.value;
    entity.name = category.name;
    entity.parentId = category.parentId?.value ?? null;
    entity.path = category.path;
    entity.level = category.level;
    entity.createdAt = category.createdAt;
    return entity;
  }
}
