import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { UnitOfWork } from "src/domain/ports/unit_of_work";

@Injectable()
export class TypeormUnitOfWork implements UnitOfWork {
  public constructor(private readonly dataSource: DataSource) {}

  public async runInTransaction<T>(work: () => Promise<T>): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await work();
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
