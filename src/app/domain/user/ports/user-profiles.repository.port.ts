export interface TUserProfile {
  userId: string;
  displayName: string;
}

export interface UserProfilesRepositoryPort {
  getByUserIds(userIds: string[]): Promise<Map<string, TUserProfile>>;
}