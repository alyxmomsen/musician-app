import { Injectable, Inject } from '@angular/core';
import {
  TrackedItemRepositoryPort,
  TrackedItemsPage,
} from '../../../domain/tracked-item/ports/tracked-item.repository.port';
import { TRACKED_ITEM_REPOSITORY_TOKEN } from '../../../core/tokens/tracked-item-repository.token';

@Injectable()
export class GetTrackedItemsPageUseCase {
  constructor(
    @Inject(TRACKED_ITEM_REPOSITORY_TOKEN)
    private readonly repo: TrackedItemRepositoryPort
  ) {}

  execute(page: number, limit: number): Promise<TrackedItemsPage> {
    return this.repo.getPage(page, limit);
  }
}