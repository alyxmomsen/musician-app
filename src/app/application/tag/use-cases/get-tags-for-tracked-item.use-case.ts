import { Injectable, Inject } from '@angular/core';
import { HashTag } from '../../../domain/tag/models/hash-tag.entity';
import { TTagLinkTarget } from '../../../domain/tag/models/tag-link.entity';
import { TagsRepositoryPort } from '../../../domain/tag/ports/tags.repository.port';
import { TAGS_REPOSITORY_TOKEN } from '../../../core/tokens/tags-repository.token';

@Injectable()
export class GetTagsForTrackedItemUseCase {
  constructor(
    @Inject(TAGS_REPOSITORY_TOKEN)
    private readonly repo: TagsRepositoryPort
  ) {}

  execute(
    trackedItemId: string
  ): Promise<Array<{ linkId: string; tag: HashTag; target: TTagLinkTarget }>> {
    return this.repo.getForTrackedItem(trackedItemId);
  }
}