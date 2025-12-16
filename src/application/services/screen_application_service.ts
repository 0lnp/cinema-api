import { Inject } from "@nestjs/common";
import { ScreenRepository } from "src/domain/repositories/screen_repository";
import {
  CreateScreenDTO,
  CreateScreenDTOSchema,
  CreateScreenResult,
  DeleteScreenDTO,
  DeleteScreenDTOSchema,
  DeleteScreenResult,
  SetScreenLayoutDTO,
  SetScreenLayoutDTOSchema,
  SetScreenLayoutResult,
} from "../dtos/screen_dto";
import { validate } from "src/shared/utilities/validation";
import { SeatLayout, SeatRow } from "src/domain/value_objects/seat_layout";
import { Screen } from "src/domain/aggregates/screen";
import {
  ApplicationError,
  ApplicationErrorCode,
} from "src/shared/exceptions/application_error";
import { ReplaceFields } from "src/shared/types/replace_fields";

export class ScreenApplicationService {
  public constructor(
    @Inject(ScreenRepository.name)
    private readonly screenRepository: ScreenRepository,
  ) {}

  public async create(request: CreateScreenDTO): Promise<CreateScreenResult> {
    const dto = validate(CreateScreenDTOSchema, request);

    const seatRows: SeatRow[] = [];
    dto.rows.forEach((row) => {
      seatRows.push({
        label: row.label,
        seatCount: row.seatCount,
      });
    });

    const screenID = await this.screenRepository.nextIdentity();
    const seatLayout = SeatLayout.create(seatRows);

    const screen = Screen.create({
      id: screenID,
      name: dto.name,
      seatLayout,
      createdBy: dto.createdBy,
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
    request: ReplaceFields<SetScreenLayoutDTO, { screenID: string }>,
  ): Promise<SetScreenLayoutResult> {
    const dto = validate(SetScreenLayoutDTOSchema, request);

    const screen = await this.screenRepository.screenOfID(dto.screenID);
    if (screen === null) {
      throw new ApplicationError({
        code: ApplicationErrorCode.SCREEN_NOT_FOUND,
        message: `Screen with ID "${dto.screenID.value}" not found`,
      });
    }

    const seatRows: SeatRow[] = [];
    dto.rows.forEach((row) => {
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
    request: ReplaceFields<DeleteScreenDTO, { screenID: string}>,
  ): Promise<DeleteScreenResult> {
    const dto = validate(DeleteScreenDTOSchema, request);

    const screen = await this.screenRepository.screenOfID(dto.screenID);
    if (screen === null) {
      throw new ApplicationError({
        code: ApplicationErrorCode.SCREEN_NOT_FOUND,
        message: `Screen with ID "${dto.screenID.value}" not found`,
      });
    }

    screen.softDelete(dto.deletedBy);

    await this.screenRepository.save(screen);

    return {
      message: "Screen deleted successfully",
      id: screen.id.value,
    };
  }
}
