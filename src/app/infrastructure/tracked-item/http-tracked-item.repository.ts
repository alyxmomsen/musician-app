import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  TrackedItemRepositoryPort,
  TrackedItemsPage,
  TrackedItemSearchParams,
  TrackedItemSearchResult,
  TTrackedItemFragmentInput,
} from '../../domain/tracked-item/ports/tracked-item.repository.port';
import { TrackedItem } from '../../domain/tracked-item/models/tracked-item.entity';
import { TrackedItemTextFragment } from '../../domain/tracked-item/models/tracked-item-text-fragment.entity';
import {
  TrackedItemDetailDto,
  TrackedItemSummaryDto,
  TrackedItemsPageDto,
} from './tracked-item.dto';

@Injectable()
export class HttpTrackedItemRepository implements TrackedItemRepositoryPort {
  private readonly apiUrl = '/api/tracked-items';

  constructor(private http: HttpClient) {}

  async getPage(page: number, limit: number): Promise<TrackedItemsPage> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    const dto = await firstValueFrom(
      this.http.get<TrackedItemsPageDto>(this.apiUrl, { params })
    );
    return {
      items: dto.items.map((s) => this.summaryToEntity(s)),
      total: dto.total,
      page: dto.page,
      limit: dto.limit,
    };
  }

  async search(params: TrackedItemSearchParams): Promise<TrackedItemSearchResult> {
    let httpParams = new HttpParams()
      .set('page', params.page)
      .set('limit', params.limit);

    if (params.q?.trim()) {
      httpParams = httpParams.set('q', params.q.trim());
    }
    if (params.artist?.trim()) {
      httpParams = httpParams.set('artist', params.artist.trim());
    }
    if (params.tags && params.tags.length > 0) {
      httpParams = httpParams.set('tags', params.tags.join(','));
    }
    if (params.tagIds && params.tagIds.length > 0) {
      httpParams = httpParams.set('tagIds', params.tagIds.join(','));
    }

    const dto = await firstValueFrom(
      this.http.get<TrackedItemsPageDto>(`${this.apiUrl}/search`, {
        params: httpParams,
      })
    );

    const matchedTagsByItemId: Record<string, string[]> = {};
    for (const s of dto.items) {
      if (s.matchedTags && s.matchedTags.length > 0) {
        matchedTagsByItemId[s.id] = s.matchedTags;
      }
    }

    return {
      items: dto.items.map((s) => this.summaryToEntity(s)),
      total: dto.total,
      page: dto.page,
      limit: dto.limit,
      matchedTagsByItemId,
    };
  }

  async getById(id: string): Promise<TrackedItem> {
    const dto = await firstValueFrom(
      this.http.get<TrackedItemDetailDto>(`${this.apiUrl}/${id}`)
    );
    return this.detailToEntity(dto);
  }

  async create(
    artistName: string,
    title: string,
    fragments: TTrackedItemFragmentInput[]
  ): Promise<TrackedItem> {
    const dto = await firstValueFrom(
      this.http.post<TrackedItemDetailDto>(this.apiUrl, {
        artistName,
        title,
        fragments,
      })
    );
    return this.detailToEntity(dto);
  }

  async update(
    id: string,
    artistName: string,
    title: string
  ): Promise<TrackedItem> {
    const dto = await firstValueFrom(
      this.http.put<TrackedItemDetailDto>(`${this.apiUrl}/${id}`, {
        artistName,
        title,
      })
    );
    return this.detailToEntity(dto);
  }

  async addFragment(
    id: string,
    fragment: TTrackedItemFragmentInput,
    position: number
  ): Promise<TrackedItem> {
    const dto = await firstValueFrom(
      this.http.post<TrackedItemDetailDto>(`${this.apiUrl}/${id}/fragments`, {
        ...fragment,
        position,
      })
    );
    return this.detailToEntity(dto);
  }

  async removeFragment(id: string, fragmentId: string): Promise<TrackedItem> {
    const dto = await firstValueFrom(
      this.http.delete<TrackedItemDetailDto>(
        `${this.apiUrl}/${id}/fragments/${fragmentId}`
      )
    );
    return this.detailToEntity(dto);
  }

  async toggleFragment(
    id: string,
    fragmentId: string,
    done: boolean
  ): Promise<TrackedItem> {
    const dto = await firstValueFrom(
      this.http.patch<TrackedItemDetailDto>(
        `${this.apiUrl}/${id}/fragments/${fragmentId}/done`,
        { done }
      )
    );
    return this.detailToEntity(dto);
  }

  async markFragmentReviewed(id: string, fragmentId: string): Promise<TrackedItem> {
    const dto = await firstValueFrom(
      this.http.patch<TrackedItemDetailDto>(
        `${this.apiUrl}/${id}/fragments/${fragmentId}/review`,
        {}
      )
    );
    return this.detailToEntity(dto);
  }

  async updateFragment(
    id: string,
    fragmentId: string,
    patch: { text?: string; title?: string }
  ): Promise<TrackedItem> {
    const dto = await firstValueFrom(
      this.http.patch<TrackedItemDetailDto>(
        `${this.apiUrl}/${id}/fragments/${fragmentId}`,
        patch
      )
    );
    return this.detailToEntity(dto);
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
  }

  private summaryToEntity(dto: TrackedItemSummaryDto): TrackedItem {
    return new TrackedItem(dto.id, dto.artistName, dto.title, dto.progress, []);
  }

  private detailToEntity(dto: TrackedItemDetailDto): TrackedItem {
    return new TrackedItem(
      dto.id,
      dto.artistName,
      dto.title,
      dto.progress,
      dto.fragments.map(
        (f) =>
          new TrackedItemTextFragment(
            f.id,
            f.text,
            f.title,
            f.isDone,
            f.lastReviewedAt
          )
      )
    );
  }
}