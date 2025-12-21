import { Inject } from "@nestjs/common";
import { ScreenRepository } from "src/domain/repositories/screen_repository";
import {
  CreateScreenDTO,
  CreateScreenResult,
  DeleteScreenDTO,
  DeleteScreenResult,
  SetScreenLayoutDTO,
  SetScreenLayoutResult,
} from "../dtos/screen_dto";
import { SeatLayout, SeatRow } from "src/domain/value_objects/seat_layout";
import { Screen } from "src/domain/aggregates/screen";
import {
  ApplicationError,
  ApplicationErrorCode,
} from "src/shared/exceptions/application_error";

export class ScreenApplicationService {
  public constructor(
    @Inject(ScreenRepository.name)
    private readonly screenRepository: ScreenRepository,
  ) {}

  public async create(request: CreateScreenDTO): Promise<CreateScreenResult> {
    const seatRows: SeatRow[] = [];
    request.rows.forEach((row) => {
      seatRows.push({
        label: row.label,
        seatCount: row.seatCount,
      });
    });

    const screenID = await this.screenRepository.nextIdentity();
    const seatLayout = SeatLayout.create(seatRows);

    const screen = Screen.create({
      id: screenID,
      name: request.name,
      seatLayout,
      createdBy: request.createdBy,
    });

    await this.screenRepository.save(screen);

    return {
      message: "Screen created successfully",
      id: screen.id.value,
      name: screen.name,
      capacity: seatLayout.totalSeats,
      seatLayout: seatLayout.rows,
      createdAt: screen.createdAt,
    };
  }

  public async setLayout(
    request: SetScreenLayoutDTO,
  ): Promise<SetScreenLayoutResult> {
    const screen = await this.screenRepository.screenOfID(request.screenID);
    if (screen === null) {
      throw new ApplicationError({
        code: ApplicationErrorCode.RESOURCE_NOT_FOUND,
        message: `Screen with ID "${request.screenID.value}" not found`,
      });
    }

    const seatRows: SeatRow[] = [];
    request.rows.forEach((row) => {
      seatRows.push({
        label: row.label,
        seatCount: row.seatCount,
      });
    });

    const seatLayout = SeatLayout.create(seatRows);
    screen.reconfigureSeating(seatLayout);

    await this.screenRepository.save(screen);

    return {
      message: "Screen layout updated successfully",
      id: screen.id.value,
      name: screen.name,
      capacity: seatLayout.totalSeats,
      seatLayout: seatLayout.rows,
    };
  }

  public async deleteScreen(
    request: DeleteScreenDTO,
  ): Promise<DeleteScreenResult> {
    const screen = await this.screenRepository.screenOfID(request.screenID);
    if (screen === null) {
      throw new ApplicationError({
        code: ApplicationErrorCode.RESOURCE_NOT_FOUND,
        message: `Screen with ID "${request.screenID.value}" not found`,
      });
    }

    screen.softDelete(request.deletedBy);

    await this.screenRepository.save(screen);

    return {
      message: "Screen deleted successfully",
      id: screen.id.value,
    };
  }
}
