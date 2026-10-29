import { InjectionToken } from '@angular/core';
import { CommentsRepositoryPort } from '../../domain/comment/ports/comments.repository.port';

export const COMMENTS_REPOSITORY_TOKEN = new InjectionToken<CommentsRepositoryPort>(
  'COMMENTS_REPOSITORY_TOKEN'
);