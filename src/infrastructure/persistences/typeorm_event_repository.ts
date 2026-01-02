import { InjectRepository } from "@nestjs/typeorm";
import {
  EventRepository,
  EventSearchFilters,
  EventSortField,
} from "src/domain/repositories/event_repository";
import { EventORMEntity } from "../databases/orm_entities/event_orm_entity";
import {
  FindOptionsOrder,
  FindOptionsWhere,
  ILike,
  IsNull,
  Repository,
} from "typeorm";
import { Event } from "src/domain/aggregates/event";
import { EventID } from "src/domain/value_objects/event_id";
import { EventStatus } from "src/domain/value_objects/event_status";
import { EventType } from "src/domain/value_objects/event_type";
import { UserID } from "src/domain/value_objects/user_id";
import { CategoryID } from "src/domain/value_objects/category_id";
import {
  InfrastructureError,
  InfrastructureErrorCode,
} from "src/shared/exceptions/infrastructure_error";
import { PaginatedQuery, PaginatedResult } from "src/shared/types/pagination";

export class TypeormEventRepository implements EventRepository {
  public constructor(
    @InjectRepository(EventORMEntity)
    private readonly ormRepository: Repository<EventORMEntity>,
  ) {}

  public async eventOfID(id: EventID): Promise<Event | null> {
    const event = await this.ormRepository.findOne({
      where: { id: id.value, deletedAt: IsNull() },
    });
    return event !== null ? this.toDomain(event) : null;
  }

  public async allEvents(
    query: PaginatedQuery<EventSortField>,
    filters?: EventSearchFilters,
  ): Promise<PaginatedResult<Event>> {
    const { page, limit, search, sort } = query;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<EventORMEntity> = {
      deletedAt: IsNull(),
    };

    if (search) {
      where.title = ILike(`%${search}%`);
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.genre) {
      where.genres = ILike(`%${filters.genre}%`);
    }

    if (filters?.releaseYear) {
      where.releaseYear = filters.releaseYear;
    }

    const order: FindOptionsOrder<EventORMEntity> = {};
    if (sort) {
      order[sort.field] = sort.order.toUpperCase() as "ASC" | "DESC";
    } else {
      order.createdAt = "DESC";
    }

    const [events, total] = await this.ormRepository.findAndCount({
      where,
      order,
      skip,
      take: limit,
    });

    return {
      items: events.map((event) => this.toDomain(event)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  public async save(event: Event): Promise<void> {
    const entity = this.toPersistence(event);
    await this.ormRepository.save(entity);
  }

  public async nextIdentity(): Promise<EventID> {
    const maxAttempts = 3;
    let attempt = 0;

    while (attempt < maxAttempts) {
      const id = EventID.generate();
      const exists = await this.ormRepository.existsBy({ id: id.value });

      if (!exists) {
        return id;
      }

      attempt++;
    }

    throw new InfrastructureError({
      code: InfrastructureErrorCode.ID_GENERATION_FAILED,
      message: `Failed to generate unique EventID after ${maxAttempts} attempts`,
    });
  }

  private toDomain(entity: EventORMEntity): Event {
    return new Event({
      id: new EventID(entity.id),
      type: entity.type as EventType,
      title: entity.title,
      description: entity.description,
      durationMinutes: Number(entity.durationMinutes),
      genres: entity.genres,
      posterPath: entity.posterPath,
      certificate: entity.certificate,
      releaseYear: entity.releaseYear !== null ? Number(entity.releaseYear) : null,
      status: entity.status as EventStatus,
      createdBy: new UserID(entity.createdBy),
      createdAt: entity.createdAt,
      lastModifiedAt: entity.lastModifiedAt,
      deletedAt: entity.deletedAt,
      deletedBy: entity.deletedBy !== null ? new UserID(entity.deletedBy) : null,
      categoryId:
        entity.categoryId !== null ? new CategoryID(entity.categoryId) : null,
    });
  }

  private toPersistence(event: Event): EventORMEntity {
    const entity = new EventORMEntity();
    entity.id = event.id.value;
    entity.type = event.type;
    entity.title = event.title;
    entity.description = event.description;
    entity.durationMinutes = event.durationMinutes;
    entity.genres = event.genres;
    entity.posterPath = event.posterPath;
    entity.certificate = event.certificate;
    entity.releaseYear = event.releaseYear;
    entity.status = event.status;
    entity.createdBy = event.createdBy.value;
    entity.createdAt = event.createdAt;
    entity.lastModifiedAt = event.lastModifiedAt;
    entity.deletedAt = event.deletedAt;
    entity.deletedBy = event.deletedBy?.value ?? null;
    entity.categoryId = event.categoryId?.value ?? null;
    return entity;
  }
}
