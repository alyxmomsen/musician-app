import { TTagLinkTarget } from '../../../domain/tag-link';
import { ITagLinksRepo } from '../../../domain/ports/tag-links-repo';

export class RemoveTagFromTargetUseCase {
    constructor(private tagLinksRepo: ITagLinksRepo) {}

    async execute(tagId: string, target: TTagLinkTarget): Promise<void> {
        const links = await this.tagLinksRepo.getByTarget(target);
        const link = links.find((l) => l.tagId === tagId);
        if (!link) return; // идемпотентно
        await this.tagLinksRepo.delete(link.id);
    }
}
