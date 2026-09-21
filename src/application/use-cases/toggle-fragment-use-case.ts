import { ITrackedItemsListRepo } from "../../domain/ports/set-list-repo";
import { TrackedItem } from "../../domain/tracked-item";

export class ToggleFragmentUseCase {
    constructor(
        private itemsListRepo: ITrackedItemsListRepo,
    ) {}

    async toggle(
        id: string,
        fragmentIndex: number,
        done: boolean
    ): Promise<TrackedItem | null> {
        const item = await this.itemsListRepo.getById(id);
        if (!item) return null;
        item.setFragmentDone(fragmentIndex, done);
        await this.itemsListRepo.updateOne(item);
        return item;
    }
}