import { ClassProps } from "src/shared/types/class_props";
import { Money } from "../value_objects/money";
import { EventID } from "../value_objects/event_id";
import { ScreenID } from "../value_objects/screen_id";
import { ShowtimeID } from "../value_objects/showtime_id";
import { ShowtimeStatus } from "../value_objects/showtime_status";
import { TimeSlot } from "../value_objects/time_slot";
import { UserID } from "../value_objects/user_id";

type ShowtimeCreateProps = Omit<
  ClassProps<Showtime>,
  | "timeSlot"
  | "status"
  | "createdAt"
  | "lastModifiedAt"
  | "deletedAt"
  | "deletedBy"
> & { startTime: Date; durationMinutes: number };

export class Showtime {
  public readonly id: ShowtimeID;
  public readonly eventID: EventID;
  public readonly screenID: ScreenID;
  public readonly timeSlot: TimeSlot;
  private _pricing: Money;
  private _status: ShowtimeStatus;
  public readonly createdBy: UserID;
  public readonly createdAt: Date;
  private _lastModifiedAt: Date;
  private _deletedAt: Date | null;
  private _deletedBy: UserID | null;

  public constructor(props: ClassProps<Showtime>) {
    this.id = props.id;
    this.eventID = props.eventID;
    this.screenID = props.screenID;
    this.timeSlot = props.timeSlot;
    this._pricing = props.pricing;
    this._status = props.status;
    this.createdBy = props.createdBy;
    this.createdAt = props.createdAt;
    this._lastModifiedAt = props.lastModifiedAt;
    this._deletedAt = props.deletedAt;
    this._deletedBy = props.deletedBy;
  }

  public static create(props: ShowtimeCreateProps): Showtime {
    const now = new Date();
    const endTime = new Date(
      props.startTime.getTime() + props.durationMinutes * 60 * 1000,
    );
    return new Showtime({
      ...props,
      timeSlot: TimeSlot.create(props.startTime, endTime),
      status: ShowtimeStatus.SCHEDULED,
      createdAt: now,
      lastModifiedAt: now,
      deletedAt: null,
      deletedBy: null,
    });
  }

  public updatePricing(pricing: Money): void {
    this._pricing = pricing;
    this._lastModifiedAt = new Date();
  }

  public cancel(): void {
    if (this._status === ShowtimeStatus.CANCELLED) {
      throw new Error("Showtime is already cancelled");
    }
    this._status = ShowtimeStatus.CANCELLED;
    this._lastModifiedAt = new Date();
  }

  public complete(): void {
    if (this._status === ShowtimeStatus.COMPLETED) {
      throw new Error("Showtime is already completed");
    }
    this._status = ShowtimeStatus.COMPLETED;
    this._lastModifiedAt = new Date();
  }

  public conflictWith(other: Showtime): boolean {
    if (this.screenID.value !== other.screenID.value) {
      return false;
    }
    return this.timeSlot.overlaps(other.timeSlot);
  }

  public softDelete(deletedBy: UserID): void {
    this._deletedAt = new Date();
    this._deletedBy = deletedBy;
  }

  public get pricing(): Money {
    return this._pricing;
  }
  public get status(): ShowtimeStatus {
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
