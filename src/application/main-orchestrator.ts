import { TrackedItem, TTrackedItemState } from '../domain/tracked-item';
import { TTrackedItemTextFragmentState } from '../domain/tracked-item-fragment';
import { ITrackedItemsListRepo } from '../domain/ports/tracked-items-list-repo';
import { ICommentsRepo } from '../domain/ports/comments-repo';
import { ITagLinksRepo } from '../domain/ports/tag-links-repo';
import { IUniqueIdGenerator } from '../domain/ports/uniqueIdGenerator';
import { ToggleFragmentUseCase } from './use-cases/toggle-fragment-use-case';

export class MainOrchestrator {
    constructor(
        private itemsListRepo: ITrackedItemsListRepo,
        private toggleFragmentUseCase: ToggleFragmentUseCase,
        private idGenerator: IUniqueIdGenerator,
        private commentsRepo: ICommentsRepo,
        private tagLinksRepo: ITagLinksRepo
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
        fragments: Array<{ text: string; title: string; isDone: boolean }>
    ): Promise<TrackedItem> {
        const fragmentsWithIds: TTrackedItemTextFragmentState[] = fragments.map(
            (f) => ({
                id: this.idGenerator.generate(),
                text: f.text,
                title: f.title,
                isDone: f.isDone,
                lastReviewedAt: null,
            })
        );

        const stateWithoutId: Omit<TTrackedItemState, 'id'> = {
            artistName,
            title,
            fragments: fragmentsWithIds,
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
        const fragmentId = this.idGenerator.generate();
        item.addFragment({ id: fragmentId, ...fragment }, position);
        await this.itemsListRepo.updateOne(item);
        return item;
    }

    async removeFragment(
        id: string,
        fragmentId: string
    ): Promise<TrackedItem | null> {
        const item = await this.itemsListRepo.getById(id);
        if (!item) return null;

        await this.commentsRepo.deleteByFragment(fragmentId);
        await this.tagLinksRepo.deleteByFragment(fragmentId);

        item.removeFragment(fragmentId);
        await this.itemsListRepo.updateOne(item);
        return item;
    }

    async toggleFragment(
        id: string,
        fragmentId: string,
        done: boolean
    ): Promise<TrackedItem | null> {
        return this.toggleFragmentUseCase.toggle(id, fragmentId, done);
    }

    async delete(id: string): Promise<void> {
        await this.commentsRepo.deleteByTrackedItem(id);
        await this.tagLinksRepo.deleteByTrackedItem(id);
        await this.itemsListRepo.removeOne(id);
    }

    async markFragmentReviewed(
        id: string,
        fragmentId: string,
        timestamp: number
    ): Promise<TrackedItem | null> {
        const item = await this.itemsListRepo.getById(id);
        if (!item) return null;
        item.markFragmentReviewed(fragmentId, timestamp);
        await this.itemsListRepo.updateOne(item);
        return item;
    }

    async updateFragment(
        id: string,
        fragmentId: string,
        patch: { text?: string; title?: string }
    ): Promise<TrackedItem | null> {
        const item = await this.itemsListRepo.getById(id);
        if (!item) return null;
        item.updateFragment(fragmentId, patch);
        await this.itemsListRepo.updateOne(item);
        return item;
    }
}