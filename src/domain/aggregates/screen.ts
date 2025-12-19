import { ClassProps } from "src/shared/types/class_props";
import { ScreenID } from "../value_objects/screen_id";
import { SeatLayout } from "../value_objects/seat_layout";
import { UserID } from "../value_objects/user_id";

type ScreenCreateProps = Omit<
  ClassProps<Screen>,
  "createdAt" | "lastModifiedAt" | "deletedAt" | "deletedBy"
>;

export class Screen {
  public readonly id: ScreenID;
  public readonly name: string;
  private _seatLayout: SeatLayout;
  public readonly createdBy: UserID;
  public readonly createdAt: Date;
  private _lastModifiedAt: Date;
  private _deletedAt: Date | null;
  private _deletedBy: UserID | null;

  public constructor(props: ClassProps<Screen>) {
    this.id = props.id;
    this.name = props.name;
    this._seatLayout = props.seatLayout;
    this.createdBy = props.createdBy;
    this.createdAt = props.createdAt;
    this._lastModifiedAt = props.lastModifiedAt;
    this._deletedAt = props.deletedAt;
    this._deletedBy = props.deletedBy;
  }

  public static create(props: ScreenCreateProps): Screen {
    const now = new Date();
    return new Screen({
      ...props,
      createdAt: now,
      lastModifiedAt: now,
      deletedAt: null,
      deletedBy: null,
    });
  }

  public reconfigureSeating(newLayout: SeatLayout) {
    this._seatLayout = newLayout;
    this._lastModifiedAt = new Date();
  }

  public softDelete(deletedBy: UserID) {
    this._deletedAt = new Date();
    this._deletedBy = deletedBy;
  }

  public get seatLayout(): SeatLayout {
    return this._seatLayout;
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
