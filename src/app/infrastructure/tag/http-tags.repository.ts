import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TagsRepositoryPort } from '../../domain/tag/ports/tags.repository.port';
import { HashTag } from '../../domain/tag/models/hash-tag.entity';
import { TTagLinkTarget } from '../../domain/tag/models/tag-link.entity';
import { HashTagDto } from './tag.dto';

@Injectable()
export class HttpTagsRepository implements TagsRepositoryPort {
  private readonly apiUrl = '/api/tags';

  constructor(private http: HttpClient) {}

  async getAll(): Promise<HashTag[]> {
    const dtos = await firstValueFrom(this.http.get<HashTagDto[]>(this.apiUrl));
    return dtos.map((d) => this.toEntity(d));
  }

  async getForTarget(target: TTagLinkTarget): Promise<HashTag[]> {
    const dtos = await firstValueFrom(
      this.http.post<HashTagDto[]>(`${this.apiUrl}/for-target`, { target })
    );
    return dtos.map((d) => this.toEntity(d));
  }

  async getTargetsForTag(tagId: string): Promise<TTagLinkTarget[]> {
    return firstValueFrom(
      this.http.get<TTagLinkTarget[]>(`${this.apiUrl}/${tagId}/targets`)
    );
  }

  async add(tagText: string, target: TTagLinkTarget): Promise<HashTag> {
    const dto = await firstValueFrom(
      this.http.post<HashTagDto>(`${this.apiUrl}/link`, { tagText, target })
    );
    return this.toEntity(dto);
  }

  async remove(tagId: string, target: TTagLinkTarget): Promise<void> {
    await firstValueFrom(
      this.http.post<void>(`${this.apiUrl}/link/remove`, { tagId, target })
    );
  }

  async deleteTag(tagId: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${tagId}`));
  }

  private toEntity(dto: HashTagDto): HashTag {
    return {
      id: dto.id,
      originalText: dto.originalText,
      normalizedText: dto.normalizedText,
    };
  }
}