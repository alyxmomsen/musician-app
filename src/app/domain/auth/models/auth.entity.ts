export type TUserRole = 'admin' | 'user';

export interface IAuthUser {
  id: string;
  role: TUserRole;
  displayName: string;
}

export interface ILoginResult {
  token: string;
  user: IAuthUser;
}