import { InjectionToken } from '@angular/core';
import { UserProfilesRepositoryPort } from '../../domain/user/ports/user-profiles.repository.port';

export const USER_PROFILES_REPOSITORY_TOKEN =
  new InjectionToken<UserProfilesRepositoryPort>(
    'USER_PROFILES_REPOSITORY_TOKEN'
  );