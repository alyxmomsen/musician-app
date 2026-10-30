import { InjectionToken } from '@angular/core';
import { AuthRepositoryPort } from '../../domain/auth/ports/auth.repository.port';

export const AUTH_REPOSITORY_TOKEN = new InjectionToken<AuthRepositoryPort>(
  'AUTH_REPOSITORY_TOKEN'
);