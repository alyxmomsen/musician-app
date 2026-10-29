import { Injectable, Inject } from '@angular/core';
import { CommentsRepositoryPort } from '../../../domain/comment/ports/comments.repository.port';
import { COMMENTS_REPOSITORY_TOKEN } from '../../../core/tokens/comments-repository.token';

@Injectable()
export class DeleteCommentUseCase {
  constructor(
    @Inject(COMMENTS_REPOSITORY_TOKEN)
    private readonly repo: CommentsRepositoryPort
  ) {}

  execute(id: string): Promise<void> {
    return this.repo.delete(id);
  }
} 