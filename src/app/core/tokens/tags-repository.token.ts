import { InjectionToken } from '@angular/core';
import { TagsRepositoryPort } from '../../domain/tag/ports/tags.repository.port';

export const TAGS_REPOSITORY_TOKEN = new InjectionToken<TagsRepositoryPort>(
  'TAGS_REPOSITORY_TOKEN'
);