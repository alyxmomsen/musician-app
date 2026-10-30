import { TUniqueId } from '../user';

export type TCredentialsState = {
    userId: TUniqueId;
    email: string;
    passwordHash: string;
};

export interface ICredentialsRepo {
    save(userId: TUniqueId, email: string, passwordHash: string): Promise<void>;
    getByUserId(userId: TUniqueId): Promise<TCredentialsState | null>;
    findByEmail(email: string): Promise<TCredentialsState | null>;
    updateEmail(userId: TUniqueId, email: string): Promise<void>;
    updatePasswordHash(userId: TUniqueId, passwordHash: string): Promise<void>;
    delete(userId: TUniqueId): Promise<void>;
}