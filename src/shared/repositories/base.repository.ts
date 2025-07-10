export abstract class BaseRepository<T, ID = string> {
  abstract findById(id: ID): Promise<T | null>;
  abstract findAll(): Promise<T[]>;
  abstract create(data: Partial<T>): Promise<T>;
  abstract update(id: ID, data: Partial<T>): Promise<T>;
  abstract delete(id: ID): Promise<void>;
}