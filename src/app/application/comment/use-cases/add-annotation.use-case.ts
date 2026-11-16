import { Injectable, Inject } from '@angular/core';
import {
  IAnnotationResult,
  TCommentTarget,
} from '../../../domain/comment/models/comment.entity';
import { CommentsRepositoryPort } from '../../../domain/comment/ports/comments.repository.port';
import { COMMENTS_REPOSITORY_TOKEN } from '../../../core/tokens/comments-repository.token';

@Injectable()
export class AddAnnotationUseCase {
  constructor(
    @Inject(COMMENTS_REPOSITORY_TOKEN)
    private readonly repo: CommentsRepositoryPort
  ) {}

  execute(
    comment: string | null,
    tags: string[],
    target: TCommentTarget
  ): Promise<IAnnotationResult> {
    return this.repo.addAnnotation(comment, tags, target);
  }
}