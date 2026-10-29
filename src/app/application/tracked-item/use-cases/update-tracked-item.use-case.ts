import { Injectable, Inject } from '@angular/core';
import { TrackedItem } from '../../../domain/tracked-item/models/tracked-item.entity';
import { TrackedItemRepositoryPort } from '../../../domain/tracked-item/ports/tracked-item.repository.port';
import { TRACKED_ITEM_REPOSITORY_TOKEN } from '../../../core/tokens/tracked-item-repository.token';

@Injectable()
export class UpdateTrackedItemUseCase {
  constructor(
    @Inject(TRACKED_ITEM_REPOSITORY_TOKEN)
    private readonly repo: TrackedItemRepositoryPort
  ) {}

  execute(id: string, artistName: string, title: string): Promise<TrackedItem> {
    return this.repo.update(id, artistName, title);
  }
}