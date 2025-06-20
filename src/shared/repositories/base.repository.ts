export abstract class BaseRepository<T> {
  abstract findById(id: number): Promise<T | null>;
  abstract findAll(): Promise<T[]>;
  abstract create(data: any): Promise<T>;
  abstract update(id: number, data: any): Promise<T>;
  abstract delete(id: number): Promise<void>;
}