import { User, TUniqueId } from '../user';

export interface IUsersRepo {
    create(user: User): Promise<void>;
    getById(id: TUniqueId): Promise<User | null>;
    getAll(): Promise<User[]>;
    update(user: User): Promise<void>;
    delete(id: TUniqueId): Promise<void>;
    count(): Promise<number>;
}