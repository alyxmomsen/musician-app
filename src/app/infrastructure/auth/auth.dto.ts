import { ILoginResult } from '../../domain/auth/models/auth.entity';

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RegisterRequestDto {
  email: string;
  password: string;
  displayName: string;
}

export type LoginResponseDto = ILoginResult;