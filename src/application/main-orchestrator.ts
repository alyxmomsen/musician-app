import { TrackedItem, TTrackedItemState } from '../domain/tracked-item';
import { ITrackedItemsListRepo } from '../domain/ports/tracked-items-list-repo';
import { ToggleFragmentUseCase } from './use-cases/toggle-fragment-use-case';
import { TTrackedItemTextFragmentState } from '../domain/tracked-item-fragment';

export class MainOrchestrator {
    constructor(
        private itemsListRepo: ITrackedItemsListRepo,
        private toggleFragmentUseCase: ToggleFragmentUseCase
    ) {}

    async getPage(
        page: number,
        limit: number
    ): Promise<{ items: TrackedItem[]; total: number }> {
        const all = await this.itemsListRepo.getAll();
        const total = all.length;
        const start = (page - 1) * limit;
        const items = all.slice(start, start + limit);
        return { items, total };
    }

    async getById(id: string): Promise<TrackedItem | null> {
        return this.itemsListRepo.getById(id);
    }

    async create(
        artistName: string,
        title: string,
        fragments: TTrackedItemTextFragmentState[]
    ): Promise<TrackedItem> {
        const stateWithoutId: Omit<TTrackedItemState, 'id'> = {
            artistName,
            title,
            fragments,
        };

        return this.itemsListRepo.create(stateWithoutId);
    }

    async update(
        id: string,
        artistName: string,
        title: string
    ): Promise<TrackedItem | null> {
        const item = await this.itemsListRepo.getById(id);
        if (!item) return null;
        item.rename(artistName, title);
        await this.itemsListRepo.updateOne(item);
        return item;
    }

    async addFragment(
        id: string,
        fragment: { text: string; title: string; isDone: boolean },
        position: number
    ): Promise<TrackedItem | null> {
        const item = await this.itemsListRepo.getById(id);
        if (!item) return null;
        item.addFragment(fragment, position);
        await this.itemsListRepo.updateOne(item);
        return item;
    }

    async removeFragment(
        id: string,
        index: number
    ): Promise<TrackedItem | null> {
        const item = await this.itemsListRepo.getById(id);
        if (!item) return null;
        item.removeFragment(index);
        await this.itemsListRepo.updateOne(item);
        return item;
    }

    async toggleFragment(
        id: string,
        fragmentIndex: number,
        done: boolean
    ): Promise<TrackedItem | null> {
        return this.toggleFragmentUseCase.toggle(id, fragmentIndex, done);
    }

    async delete(id: string): Promise<void> {
        await this.itemsListRepo.removeOne(id);
    }

    async markFragmentReviewed(
        id: string,
        index: number,
        timestamp: number
    ): Promise<TrackedItem | null> {
        const item = await this.itemsListRepo.getById(id);
        if (!item) return null;
        item.markFragmentReviewed(index, timestamp);
        await this.itemsListRepo.updateOne(item);
        return item;
    }

    async updateFragment(
        id: string,
        index: number,
        patch: { text?: string; title?: string }
    ): Promise<TrackedItem | null> {
        const item = await this.itemsListRepo.getById(id);
        if (!item) return null;
        item.updateFragment(index, patch);
        await this.itemsListRepo.updateOne(item);
        return item;
    }
}