import { Injectable, Inject } from '@angular/core';
import { TTagLinkTarget } from '../../../domain/tag/models/tag-link.entity';
import { TagsRepositoryPort } from '../../../domain/tag/ports/tags.repository.port';
import { TAGS_REPOSITORY_TOKEN } from '../../../core/tokens/tags-repository.token';

@Injectable()
export class RemoveTagUseCase {
  constructor(
    @Inject(TAGS_REPOSITORY_TOKEN)
    private readonly repo: TagsRepositoryPort
  ) {}

  execute(tagId: string, target: TTagLinkTarget): Promise<void> {
    return this.repo.remove(tagId, target);
  }
}