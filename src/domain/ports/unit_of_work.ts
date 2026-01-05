export abstract class UnitOfWork {
  public abstract runInTransaction<T>(work: () => Promise<T>): Promise<T>;
}
