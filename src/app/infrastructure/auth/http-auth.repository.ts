import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthRepositoryPort } from '../../domain/auth/ports/auth.repository.port';
import { ILoginResult } from '../../domain/auth/models/auth.entity';
import {
  LoginRequestDto,
  RegisterRequestDto,
} from './auth.dto';

@Injectable()
export class HttpAuthRepository implements AuthRepositoryPort {
  private readonly apiUrl = '/api/auth';

  constructor(private http: HttpClient) {}

  async login(email: string, password: string): Promise<ILoginResult> {
    const body: LoginRequestDto = { email, password };
    return firstValueFrom(this.http.post<ILoginResult>(`${this.apiUrl}/login`, body));
  }

  async register(email: string, password: string, displayName: string): Promise<void> {
    const body: RegisterRequestDto = { email, password, displayName };
    await firstValueFrom(this.http.post<void>(`${this.apiUrl}/register`, body));
  }
}