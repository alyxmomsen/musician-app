import { ITrackedItemsListRepo } from '../../domain/ports/tracked-items-list-repo';
import { TrackedItem } from '../../domain/tracked-item';

export class ToggleFragmentUseCase {
    constructor(private itemsListRepo: ITrackedItemsListRepo) {}

    async toggle(
        id: string,
        fragmentId: string,
        done: boolean
    ): Promise<TrackedItem | null> {
        const item = await this.itemsListRepo.getById(id);
        if (!item) return null;
        item.setFragmentDone(fragmentId, done);
        await this.itemsListRepo.updateOne(item);
        return item;
    }
}
