import { TUniqueId } from '../user';

export type TUserProfileState = {
    userId: TUniqueId;
    displayName: string;
};

export interface IUserProfilesRepo {
    save(userId: TUniqueId, displayName: string): Promise<void>;
    getByUserId(userId: TUniqueId): Promise<TUserProfileState | null>;
    getByUserIds(userIds: TUniqueId[]): Promise<Map<TUniqueId, TUserProfileState>>;
    getByDisplayName(displayName: string): Promise<TUserProfileState | null>;
    updateDisplayName(userId: TUniqueId, displayName: string): Promise<void>;
    delete(userId: TUniqueId): Promise<void>;
}