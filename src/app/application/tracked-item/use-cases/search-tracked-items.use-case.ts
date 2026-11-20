import { Injectable, Inject } from '@angular/core';
import {
  TrackedItemRepositoryPort,
  TrackedItemSearchParams,
  TrackedItemSearchResult,
} from '../../../domain/tracked-item/ports/tracked-item.repository.port';
import { TRACKED_ITEM_REPOSITORY_TOKEN } from '../../../core/tokens/tracked-item-repository.token';

@Injectable()
export class SearchTrackedItemsUseCase {
  constructor(
    @Inject(TRACKED_ITEM_REPOSITORY_TOKEN)
    private readonly repo: TrackedItemRepositoryPort
  ) {}

  execute(params: TrackedItemSearchParams): Promise<TrackedItemSearchResult> {
    return this.repo.search(params);
  }
}
