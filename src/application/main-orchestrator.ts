import { TrackedItem, TTrackedItemState } from '../domain/tracked-item';
import { ITrackedItemsListRepo } from '../domain/ports/tracked-items-list-repo';
import { FragmentList } from '../domain/fragment-list';
import { ToggleFragmentUseCase } from './use-cases/toggle-fragment-use-case';

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
        text: string
    ): Promise<TrackedItem> {
        const fragments = FragmentList.fromText(text);

        const stateWithoutId: Omit<TTrackedItemState, 'id'> = {
            artistName,
            title,
            fragments: fragments.getState(),
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
        text: string,
        position: number
    ): Promise<TrackedItem | null> {
        const item = await this.itemsListRepo.getById(id);
        if (!item) return null;
        item.addFragment(text, position);
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

    async renameFragmentTitle(
        id: string,
        index: number,
        title: string
    ): Promise<TrackedItem | null> {
        const item = await this.itemsListRepo.getById(id);
        if (!item) return null;
        item.renameFragmentTitle(index, title);
        await this.itemsListRepo.updateOne(item);
        return item;
    }
}