import { ITrackedItemListRepo } from "../../domain/ports/set-list-repo";
import { TrackedItem } from "../../domain/tracked-item";


export class ToggleFragmentUseCase {
    constructor (
        private itemsListRepo:ITrackedItemListRepo,
    ) {}

    async toggle (
        id: string,
        fragmentIndex: number,
        done: boolean
    ) {
        const item = await this.itemsListRepo.getById(id);
        if (!item) return null;
        item.setFragmentDone(fragmentIndex, done);

        await this.itemsListRepo.updateOne(item.getDTO());

        return item;
    }

    private async incrementItemProgress(
        id: string,
        amount: number
    ): Promise<TrackedItem | null> {
        const item = await this.itemsListRepo.getById(id);
        if (!item) return null;
        item.incrementProgress(amount);
        await this.itemsListRepo.updateOne(item.getDTO());
        return item;
    }

    private async decrementItemProgress(
        id: string,
        amount: number
    ): Promise<TrackedItem | null> {
        const item = await this.itemsListRepo.getById(id);
        if (!item) return null;
        item.decrementProgress(amount);
        await this.itemsListRepo.updateOne(item.getDTO());
        return item;
    }
}