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

  async getForTrackedItem(
    trackedItemId: string
  ): Promise<Array<{ tag: HashTag; target: TTagLinkTarget }>> {
    const dtos = await firstValueFrom(
      this.http.get<Array<{ tag: HashTagDto; target: TTagLinkTarget }>>(
        `${this.apiUrl}/for-tracked-item/${trackedItemId}`
      )
    );
    return dtos.map((d) => ({
      tag: this.toEntity(d.tag),
      target: d.target,
    }));
  }

  async getTargetsForTag(tagId: string): Promise<TTagLinkTarget[]> {
    return firstValueFrom(
      this.http.get<TTagLinkTarget[]>(`${this.apiUrl}/${tagId}/targets`)
    );
  }

  async add(
    tagText: string,
    target: TTagLinkTarget,
    description: string = ''
  ): Promise<HashTag> {
    const dto = await firstValueFrom(
      this.http.post<HashTagDto>(`${this.apiUrl}/link`, {
        tagText,
        target,
        description,
      })
    );
    return this.toEntity(dto);
  }

  async updateDescription(tagId: string, description: string): Promise<HashTag> {
    const dto = await firstValueFrom(
      this.http.patch<HashTagDto>(`${this.apiUrl}/${tagId}/description`, {
        description,
      })
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
      description: dto.description ?? '',
      createdBy: dto.createdBy ?? '',
    };
  }

  async getForComments(commentIds: string[]): Promise<Map<string, HashTag[]>> {
    if (commentIds.length === 0) return new Map();
    const dtos = await firstValueFrom(
      this.http.post<Array<{ commentId: string; tags: HashTagDto[] }>>(
        `${this.apiUrl}/for-comments`,
        { commentIds }
      )
    );
    const map = new Map<string, HashTag[]>();
    for (const d of dtos) {
      map.set(d.commentId, d.tags.map((t) => this.toEntity(t)));
    }
    return map;
  }
}