import { HashTag } from '../../../domain/hash-tag';
import { TagLink, TTagLinkTarget } from '../../../domain/tag-link';
import { ITagsRepo } from '../../../domain/ports/tags-repo';
import { ITagLinksRepo } from '../../../domain/ports/tag-links-repo';
import { IUniqueIdGenerator } from '../../../domain/ports/uniqueIdGenerator';

export class AddTagToTargetUseCase {
    constructor(
        private tagsRepo: ITagsRepo,
        private tagLinksRepo: ITagLinksRepo,
        private idGenerator: IUniqueIdGenerator
    ) {}

    async execute(
        tagText: string,
        target: TTagLinkTarget
    ): Promise<{ tag: HashTag; link: TagLink }> {
        const trimmed = tagText.trim();
        if (!trimmed) {
            throw new Error('Tag text cannot be empty');
        }
        if (/\s/.test(trimmed)) {
            throw new Error('Tag text must not contain whitespace; split tags on client');
        }

        const normalized = trimmed.toLowerCase();

        let tag = await this.tagsRepo.getByNormalizedText(normalized);
        if (!tag) {
            const tagId = this.idGenerator.generate();
            tag = new HashTag(tagId, trimmed, normalized);
            await this.tagsRepo.create(tag);
        }

        const existingLinks = await this.tagLinksRepo.getByTarget(target);
        const existing = existingLinks.find((l) => l.tagId === tag.id);
        if (existing) {
            return { tag, link: existing };
        }

        const linkId = this.idGenerator.generate();
        const link = new TagLink(linkId, tag.id, target, Date.now());
        await this.tagLinksRepo.create(link);

        return { tag, link };
    }
}