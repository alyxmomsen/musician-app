import { Injectable, Inject } from '@angular/core';
import { TrackedItemRepositoryPort } from '../../../domain/tracked-item/ports/tracked-item.repository.port';
import { TRACKED_ITEM_REPOSITORY_TOKEN } from '../../../core/tokens/tracked-item-repository.token';

@Injectable()
export class DeleteTrackedItemUseCase {
  constructor(
    @Inject(TRACKED_ITEM_REPOSITORY_TOKEN)
    private readonly repo: TrackedItemRepositoryPort
  ) {}

  execute(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}