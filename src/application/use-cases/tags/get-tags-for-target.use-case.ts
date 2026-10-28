import { HashTag } from '../../../domain/hash-tag';
import { TTagLinkTarget } from '../../../domain/tag-link';
import { ITagsRepo } from '../../../domain/ports/tags-repo';
import { ITagLinksRepo } from '../../../domain/ports/tag-links-repo';

export class GetTagsForTargetUseCase {
    constructor(
        private tagsRepo: ITagsRepo,
        private tagLinksRepo: ITagLinksRepo
    ) {}

    async execute(target: TTagLinkTarget): Promise<HashTag[]> {
        const links = await this.tagLinksRepo.getByTarget(target);
        const result: HashTag[] = [];
        for (const link of links) {
            const tag = await this.tagsRepo.getById(link.tagId);
            if (tag) result.push(tag);
        }
        return result;
    }
}