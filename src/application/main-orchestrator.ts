import { TrackedItem } from '../domain/tracked-item';
import { ITrackedItemsListRepo } from '../domain/ports/set-list-repo';
import { ToggleFragmentUseCase } from './use-cases/toggle-fragment-use-case';

export class MainOrchestrator {
    constructor(
        private itemsListRepo: ITrackedItemsListRepo,
        private toggleFragmentUseCase: ToggleFragmentUseCase,
    ) {}

    async getAll(): Promise<TrackedItem[]> {
        return this.itemsListRepo.getAll();
    }

    async toggleFragment(
        id: string,
        fragmentIndex: number,
        done: boolean
    ): Promise<TrackedItem | null> {
        return this.toggleFragmentUseCase.toggle(id, fragmentIndex, done);
    }
}