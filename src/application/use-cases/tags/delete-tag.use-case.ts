import { ITagsRepo } from '../../../domain/ports/tags-repo';
import { ITagLinksRepo } from '../../../domain/ports/tag-links-repo';

export class DeleteTagUseCase {
    constructor(
        private tagsRepo: ITagsRepo,
        private tagLinksRepo: ITagLinksRepo
    ) {}

    async execute(tagId: string): Promise<void> {
        await this.tagLinksRepo.deleteByTagId(tagId);
        await this.tagsRepo.delete(tagId);
    }
}