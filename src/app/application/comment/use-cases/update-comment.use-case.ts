import { Injectable, Inject } from '@angular/core';
import { Comment } from '../../../domain/comment/models/comment.entity';
import { CommentsRepositoryPort } from '../../../domain/comment/ports/comments.repository.port';
import { COMMENTS_REPOSITORY_TOKEN } from '../../../core/tokens/comments-repository.token';

@Injectable()
export class UpdateCommentUseCase {
  constructor(
    @Inject(COMMENTS_REPOSITORY_TOKEN)
    private readonly repo: CommentsRepositoryPort
  ) {}

  execute(id: string, text: string): Promise<Comment> {
    return this.repo.update(id, text);
  }
}