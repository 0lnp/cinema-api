import { ClassProps } from "src/shared/types/class_props";
import { MovieID } from "../value_objects/movie_id";
import { UserID } from "../value_objects/user_id";
import { MovieStatus } from "../value_objects/movie_status";

type MovieCreateProps = Omit<
  ClassProps<Movie>,
  "status" | "createdAt" | "lastModifiedAt" | "deletedAt" | "deletedBy"
>;

export class Movie {
  public readonly id: MovieID;
  public readonly title: string;
  public readonly synopsis: string;
  public readonly durationMinutes: number;
  public readonly genres: string[];
  public readonly certificate: string;
  public readonly releaseYear: number;
  public readonly posterPath: string;
  private _status: MovieStatus;
  public readonly createdAt: Date;
  public readonly createdBy: UserID;
  private _lastModifiedAt: Date;
  private _deletedAt: Date | null;
  private _deletedBy: UserID | null;

  public constructor(props: ClassProps<Movie>) {
    this.id = props.id;
    this.title = props.title;
    this.synopsis = props.synopsis;
    this.durationMinutes = props.durationMinutes;
    this.genres = props.genres;
    this.certificate = props.certificate;
    this.releaseYear = props.releaseYear;
    this.posterPath = props.posterPath;
    this._status = props.status;
    this.createdAt = props.createdAt;
    this.createdBy = props.createdBy;
    this._lastModifiedAt = props.lastModifiedAt;
    this._deletedAt = props.deletedAt;
    this._deletedBy = props.deletedBy;
  }

  public static create(props: MovieCreateProps): Movie {
    const now = new Date();
    return new Movie({
      ...props,
      status: MovieStatus.COMING_SOON,
      createdAt: now,
      lastModifiedAt: now,
      deletedAt: null,
      deletedBy: null,
    });
  }

  public changeStatus(status: MovieStatus) {
    this._status = status;
    this._lastModifiedAt = new Date();
  }

  public softDelete(deletedBy: UserID) {
    this._deletedAt = new Date();
    this._deletedBy = deletedBy;
  }

  public get status(): MovieStatus {
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
}
