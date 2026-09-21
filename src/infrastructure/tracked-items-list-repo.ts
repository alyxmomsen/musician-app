import { readFile, writeFile } from 'fs/promises';
import { resolve, normalize } from 'path';
import { IUniqueIdGenerator } from '../domain/ports/uniqueIdGenerator';
import { ITrackedItemsListRepo } from '../domain/ports/set-list-repo';
import {
    TrackedItem,
    TTrackedItemState,
    TTrackedItemUniqueId,
} from '../domain/tracked-item';
import { TrackedItemTextFragment } from '../domain/tracked-item-fragment';

export class TrackedItemsListRepo implements ITrackedItemsListRepo {
    private items: Map<TTrackedItemUniqueId, TTrackedItemState> = new Map();
    private readonly path: string;

    constructor(
        private readonly uniqueIdGenerator: IUniqueIdGenerator,
        path: string
    ) {
        this.path = normalize(resolve(path));
    }

    async init(): Promise<void> {
        try {
            const raw = await readFile(this.path, 'utf-8');
            const setList = JSON.parse(raw) as { items: TTrackedItemState[] };
            setList.items.forEach((item) => {
                this.items.set(item.id, item);
            });
        } catch {
            this.items = new Map();
        }
    }

    private async persist(): Promise<void> {
        const serialized = JSON.stringify(
            { items: Array.from(this.items.values()) },
            null,
            2
        );
        await writeFile(this.path, serialized, 'utf-8');
    }

    async addMany(items: Omit<TTrackedItemState, 'id'>[]): Promise<void> {
        for (const item of items) {
            const id = this.uniqueIdGenerator.generate();
            this.items.set(id, { ...item, id });
        }
        await this.persist();
    }

    async updateOne(item: TrackedItem): Promise<void> {
        if (!this.items.has(item.id)) {
            throw new Error(`Item with id ${item.id} not found`);
        }
        this.items.set(item.id, item.getState());
        await this.persist();
    }

    async removeOne(id: TTrackedItemUniqueId): Promise<void> {
        this.items.delete(id);
        await this.persist();
    }

    async findByArtistName(artistName: string): Promise<TrackedItem[]> {
        return Array.from(this.items.values())
            .filter((item) => item.artistName === artistName)
            .map((s) => this.mapToDomain(s));
    }

    async getAll(): Promise<TrackedItem[]> {
        return Array.from(this.items.values()).map((s) => this.mapToDomain(s));
    }

    async getById(id: TTrackedItemUniqueId): Promise<TrackedItem | null> {
        const state = this.items.get(id);
        if (state === undefined) return null;
        return this.mapToDomain(state);
    }

    async getRandom(): Promise<TrackedItem | null> {
        const arr = Array.from(this.items.values());
        if (arr.length < 1) return null;
        return this.mapToDomain(arr[Math.floor(Math.random() * arr.length)]);
    }

    private mapToDomain(state: TTrackedItemState): TrackedItem {
        return new TrackedItem(
            state.id,
            state.artistName,
            state.title,
            state.fragments.map(
                (f) => new TrackedItemTextFragment(f.text, f.isDone)
            )
        );
    }
}