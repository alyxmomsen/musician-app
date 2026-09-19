import { ITrackedItemListRepo } from './ports/set-list-repo';

export class ItemsListManager {
    constructor(private setListRepo: ITrackedItemListRepo) {}

    update() {
        this.setListRepo;
    }
}
