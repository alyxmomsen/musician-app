import { TrackedItem } from '../domain/tracked-item';
import { ITrackedItemListRepo } from '../domain/ports/set-list-repo';
import { ToggleFragmentUseCase } from './use-cases/toggle-fragment-use-case';

export class MainOrchestrator {
    constructor(
        private itemsListRepo: ITrackedItemListRepo,
        private toggleFragmentUseCase:ToggleFragmentUseCase,
    ) {}

    async getAll(): Promise<TrackedItem[]> {
        const all = await this.itemsListRepo.getAll();

        return all;
    }

    async toggleFragment(
        id: string,
        fragmentIndex: number,
        done: boolean
    ): Promise<TrackedItem | null> {

        return this.toggleFragmentUseCase.toggle(id, fragmentIndex, done);


    }

    async getProgress () {
        // здесь ли должно быть вычисление прогресса
    }

    async tick() {
        const items = await this.itemsListRepo.getAll();
        // this.setListRepo.getAll();
    }
}
