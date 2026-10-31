import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  UserProfilesRepositoryPort,
  TUserProfile,
} from '../../domain/user/ports/user-profiles.repository.port';
import { UserProfileDto } from './user-profiles.dto';

@Injectable()
export class HttpUserProfilesRepository implements UserProfilesRepositoryPort {
  private readonly apiUrl = '/api/profiles';

  constructor(private http: HttpClient) {}

  async getByUserIds(userIds: string[]): Promise<Map<string, TUserProfile>> {
    if (userIds.length === 0) return new Map();
    const dtos = await firstValueFrom(
      this.http.post<UserProfileDto[]>(`${this.apiUrl}/batch`, { userIds })
    );
    const map = new Map<string, TUserProfile>();
    dtos.forEach((d) =>
      map.set(d.userId, { userId: d.userId, displayName: d.displayName })
    );
    return map;
  }
}