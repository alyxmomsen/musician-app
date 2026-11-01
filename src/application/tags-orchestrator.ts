import { HashTag } from '../domain/hash-tag';
import { TTagLinkTarget } from '../domain/tag-link';
import { AddTagToTargetUseCase } from './use-cases/tags/add-tag-to-target.use-case';
import { RemoveTagFromTargetUseCase } from './use-cases/tags/remove-tag-from-target.use-case';
import { DeleteTagUseCase } from './use-cases/tags/delete-tag.use-case';
import { GetTagsForTargetUseCase } from './use-cases/tags/get-tags-for-target.use-case';
import { GetTargetsForTagUseCase } from './use-cases/tags/get-targets-for-tag.use-case';
import { GetAllTagsUseCase } from './use-cases/tags/get-all-tags.use-case';
import { GetTagLinksByTrackedItemUseCase } from './use-cases/tags/get-tag-links-by-tracked-item.use-case';
import { GetTagByIdUseCase } from './use-cases/tags/get-tag-by-id.use-case';
import { UpdateTagDescriptionUseCase } from './use-cases/tags/update-tag-description.use-case';

export class TagsOrchestrator {
    constructor(
        private addTagUseCase: AddTagToTargetUseCase,
        private removeTagUseCase: RemoveTagFromTargetUseCase,
        private deleteTagUseCase: DeleteTagUseCase,
        private getTagsForTargetUseCase: GetTagsForTargetUseCase,
        private getTargetsForTagUseCase: GetTargetsForTagUseCase,
        private getAllTagsUseCase: GetAllTagsUseCase,

        private getTagLinksByTrackedItem: GetTagLinksByTrackedItemUseCase,
        private getTagById: GetTagByIdUseCase,

        private updateTagDescriptionUseCase: UpdateTagDescriptionUseCase,
    ) {}

    async add(
        tagText: string,
        target: TTagLinkTarget,
        authorId: string,
        description: string = ''
    ): Promise<{ tag: HashTag }> {
        const { tag } = await this.addTagUseCase.execute(
            tagText,
            target,
            authorId,
            description
        );
        return { tag };
    }

    async remove(tagId: string, target: TTagLinkTarget): Promise<void> {
        return this.removeTagUseCase.execute(tagId, target);
    }

    async delete(tagId: string): Promise<void> {
        return this.deleteTagUseCase.execute(tagId);
    }

    async getForTarget(target: TTagLinkTarget): Promise<HashTag[]> {
        return this.getTagsForTargetUseCase.execute(target);
    }

    async getTargetsForTag(tagId: string): Promise<TTagLinkTarget[]> {
        return this.getTargetsForTagUseCase.execute(tagId);
    }

    async getAll(): Promise<HashTag[]> {
        return this.getAllTagsUseCase.execute();
    }

    async getForTrackedItem(
        trackedItemId: string
    ): Promise<Array<{ tag: HashTag; target: TTagLinkTarget }>> {
        const links =
            await this.getTagLinksByTrackedItem.execute(trackedItemId);
        const result: Array<{ tag: HashTag; target: TTagLinkTarget }> = [];
        for (const link of links) {
            const tag = await this.getTagById.execute(link.tagId);
            if (tag) result.push({ tag, target: link.target });
        }
        return result;
    }

    async updateDescription(
        tagId: string,
        description: string,
        userId: string
    ): Promise<HashTag> {
        return this.updateTagDescriptionUseCase.execute(tagId, description, userId);
    }
}
