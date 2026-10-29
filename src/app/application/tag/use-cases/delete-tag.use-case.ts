import { Injectable, Inject } from '@angular/core';
import { TagsRepositoryPort } from '../../../domain/tag/ports/tags.repository.port';
import { TAGS_REPOSITORY_TOKEN } from '../../../core/tokens/tags-repository.token';

@Injectable()
export class DeleteTagUseCase {
  constructor(
    @Inject(TAGS_REPOSITORY_TOKEN)
    private readonly repo: TagsRepositoryPort
  ) {}

  execute(tagId: string): Promise<void> {
    return this.repo.deleteTag(tagId);
  }
}