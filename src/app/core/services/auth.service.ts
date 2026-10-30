import { Injectable, Inject, signal, computed } from '@angular/core';
import { AUTH_REPOSITORY_TOKEN } from '../tokens/auth-repository.token';
import { AuthRepositoryPort } from '../../domain/auth/ports/auth.repository.port';
import { IAuthUser } from '../../domain/auth/models/auth.entity';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUser = signal<IAuthUser | null>(this.loadUser());

  readonly user = computed(() => this.currentUser());
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  constructor(
    @Inject(AUTH_REPOSITORY_TOKEN)
    private readonly repo: AuthRepositoryPort
  ) {}

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  async login(email: string, password: string): Promise<void> {
    const result = await this.repo.login(email, password);
    localStorage.setItem(TOKEN_KEY, result.token);
    localStorage.setItem(USER_KEY, JSON.stringify(result.user));
    this.currentUser.set(result.user);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
  }

  private loadUser(): IAuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as IAuthUser;
    } catch {
      return null;
    }
  }
}