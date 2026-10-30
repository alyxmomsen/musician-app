import { TagLink, TTagLinkTarget } from '../../../domain/tag-link';
import { ITagLinksRepo } from '../../../domain/ports/tag-links-repo';

export class GetTargetsForTagUseCase {
    constructor(private tagLinksRepo: ITagLinksRepo) {}

    async execute(tagId: string): Promise<TTagLinkTarget[]> {
        const links = await this.tagLinksRepo.getByTagId(tagId);
        return links.map((l) => l.target);
    }
}
