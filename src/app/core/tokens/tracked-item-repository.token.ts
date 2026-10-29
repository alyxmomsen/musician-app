import { InjectionToken } from '@angular/core';
import { TrackedItemRepositoryPort } from '../../domain/tracked-item/ports/tracked-item.repository.port';

export const TRACKED_ITEM_REPOSITORY_TOKEN = new InjectionToken<TrackedItemRepositoryPort>(
  'TRACKED_ITEM_REPOSITORY_TOKEN',
);
