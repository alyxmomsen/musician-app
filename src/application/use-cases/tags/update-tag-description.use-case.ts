import { HashTag } from '../../../domain/hash-tag';
import { ITagsRepo } from '../../../domain/ports/tags-repo';

export class UpdateTagDescriptionUseCase {
    constructor(private tagsRepo: ITagsRepo) {}

    async execute(
        tagId: string,
        description: string,
        userId: string
    ): Promise<HashTag> {
        const tag = await this.tagsRepo.getById(tagId);
        if (!tag) {
            throw new Error('Tag not found');
        }
        if (tag.createdBy !== userId) {
            throw new Error('Only the tag author can edit its description');
        }
        tag.setDescription(description.trim());
        await this.tagsRepo.update(tag);
        return tag;
    }
}