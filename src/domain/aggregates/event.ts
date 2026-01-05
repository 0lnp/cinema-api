import { ClassProps } from "src/shared/types/class_props";
import { EventID } from "../value_objects/event_id";
import { UserID } from "../value_objects/user_id";
import { EventStatus } from "../value_objects/event_status";
import { EventType } from "../value_objects/event_type";
import { CategoryID } from "../value_objects/category_id";

type EventCreateProps = Omit<
  ClassProps<Event>,
  | "status"
  | "createdAt"
  | "lastModifiedAt"
  | "deletedAt"
  | "deletedBy"
  | "categoryId"
>;

export class Event {
  public readonly id: EventID;
  public readonly type: EventType;
  public readonly title: string;
  public readonly description: string;
  public readonly durationMinutes: number;
  public readonly genres: string[];
  public readonly posterPath: string | null;
  public readonly certificate: string | null;
  public readonly releaseYear: number | null;
  private _status: EventStatus;
  public readonly createdAt: Date;
  public readonly createdBy: UserID;
  private _lastModifiedAt: Date;
  private _deletedAt: Date | null;
  private _deletedBy: UserID | null;
  private _categoryId: CategoryID | null;

  public constructor(props: ClassProps<Event>) {
    this.id = props.id;
    this.type = props.type;
    this.title = props.title;
    this.description = props.description;
    this.durationMinutes = props.durationMinutes;
    this.genres = props.genres;
    this.posterPath = props.posterPath;
    this.certificate = props.certificate;
    this.releaseYear = props.releaseYear;
    this._status = props.status;
    this.createdAt = props.createdAt;
    this.createdBy = props.createdBy;
    this._lastModifiedAt = props.lastModifiedAt;
    this._deletedAt = props.deletedAt;
    this._deletedBy = props.deletedBy;
    this._categoryId = props.categoryId;
  }

  public static create(props: EventCreateProps): Event {
    if (!props.title || props.title.trim().length === 0) {
      throw new Error("Event title is required");
    }
    if (props.durationMinutes <= 0) {
      throw new Error("Duration must be positive");
    }
    if (props.type === "MOVIE" && !props.certificate) {
      throw new Error("Certificate is required for movie events");
    }
    if (props.type === "MOVIE" && !props.releaseYear) {
      throw new Error("Release year is required for movie events");
    }

    const now = new Date();
    return new Event({
      ...props,
      status: "COMING_SOON",
      createdAt: now,
      lastModifiedAt: now,
      deletedAt: null,
      deletedBy: null,
      categoryId: null,
    });
  }

  public changeStatus(status: EventStatus) {
    this._status = status;
    this._lastModifiedAt = new Date();
  }

  public softDelete(deletedBy: UserID) {
    this._deletedAt = new Date();
    this._deletedBy = deletedBy;
  }

  public setCategory(categoryId: CategoryID | null): void {
    this._categoryId = categoryId;
    this._lastModifiedAt = new Date();
  }

  public isMovie(): boolean {
    return this.type === "MOVIE";
  }

  public get status(): EventStatus {
    return this._status;
  }
  public get lastModifiedAt(): Date {
    return this._lastModifiedAt;
  }
  public get deletedAt(): Date | null {
    return this._deletedAt;
  }
  public get deletedBy(): UserID | null {
    return this._deletedBy;
  }
  public get categoryId(): CategoryID | null {
    return this._categoryId;
  }
}
