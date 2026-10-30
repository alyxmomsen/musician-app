import { ILoginResult } from '../models/auth.entity';

export interface AuthRepositoryPort {
  login(email: string, password: string): Promise<ILoginResult>;
  register(email: string, password: string, displayName: string): Promise<void>;
}