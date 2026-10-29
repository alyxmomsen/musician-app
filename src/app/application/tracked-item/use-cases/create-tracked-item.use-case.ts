import { Injectable, Inject } from '@angular/core';
import { TrackedItem } from '../../../domain/tracked-item/models/tracked-item.entity';
import {
  TrackedItemRepositoryPort,
  TTrackedItemFragmentInput,
} from '../../../domain/tracked-item/ports/tracked-item.repository.port';
import { TRACKED_ITEM_REPOSITORY_TOKEN } from '../../../core/tokens/tracked-item-repository.token';

@Injectable()
export class CreateTrackedItemUseCase {
  constructor(
    @Inject(TRACKED_ITEM_REPOSITORY_TOKEN)
    private readonly repo: TrackedItemRepositoryPort
  ) {}

  execute(
    artistName: string,
    title: string,
    fragments: TTrackedItemFragmentInput[]
  ): Promise<TrackedItem> {
    return this.repo.create(artistName, title, fragments);
  }
}