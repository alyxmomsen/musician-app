import { TagLink } from '../../../domain/tag-link';
import { ITagLinksRepo } from '../../../domain/ports/tag-links-repo';

export class GetTagLinksByTrackedItemUseCase {
    constructor(private tagLinksRepo: ITagLinksRepo) {}

    execute(trackedItemId: string): Promise<TagLink[]> {
        return this.tagLinksRepo.getByTrackedItem(trackedItemId);
    }
}