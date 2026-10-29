import { Injectable, Inject } from '@angular/core';
import { TrackedItem } from '../../../domain/tracked-item/models/tracked-item.entity';
import {
  TrackedItemRepositoryPort,
  TTrackedItemFragmentInput,
} from '../../../domain/tracked-item/ports/tracked-item.repository.port';
import { TRACKED_ITEM_REPOSITORY_TOKEN } from '../../../core/tokens/tracked-item-repository.token';

@Injectable()
export class AddFragmentUseCase {
  constructor(
    @Inject(TRACKED_ITEM_REPOSITORY_TOKEN)
    private readonly repo: TrackedItemRepositoryPort
  ) {}

  execute(
    id: string,
    fragment: TTrackedItemFragmentInput,
    position: number
  ): Promise<TrackedItem> {
    return this.repo.addFragment(id, fragment, position);
  }
}