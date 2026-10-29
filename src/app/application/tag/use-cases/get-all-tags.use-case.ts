import { Injectable, Inject } from '@angular/core';
import { HashTag } from '../../../domain/tag/models/hash-tag.entity';
import { TagsRepositoryPort } from '../../../domain/tag/ports/tags.repository.port';
import { TAGS_REPOSITORY_TOKEN } from '../../../core/tokens/tags-repository.token';

@Injectable()
export class GetAllTagsUseCase {
  constructor(
    @Inject(TAGS_REPOSITORY_TOKEN)
    private readonly repo: TagsRepositoryPort
  ) {}

  execute(): Promise<HashTag[]> {
    return this.repo.getAll();
  }
}