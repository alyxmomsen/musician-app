import { Injectable, Inject } from '@angular/core';
import { HashTag } from '../../../domain/tag/models/hash-tag.entity';
import { TTagLinkTarget } from '../../../domain/tag/models/tag-link.entity';
import { TagsRepositoryPort } from '../../../domain/tag/ports/tags.repository.port';
import { TAGS_REPOSITORY_TOKEN } from '../../../core/tokens/tags-repository.token';

@Injectable()
export class AddTagUseCase {
  constructor(
    @Inject(TAGS_REPOSITORY_TOKEN)
    private readonly repo: TagsRepositoryPort
  ) {}

  execute(tagText: string, target: TTagLinkTarget): Promise<HashTag> {
    return this.repo.add(tagText, target);
  }
}