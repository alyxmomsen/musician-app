import { readFile, writeFile } from 'fs/promises';
import { resolve, normalize } from 'path';
import { IUniqueIdGenerator } from '../domain/ports/uniqueIdGenerator';
import { ITrackedItemsListRepo } from '../domain/ports/tracked-items-list-repo';
import {
    TrackedItem,
    TTrackedItemState,
    TTrackedItemUniqueId,
} from '../domain/tracked-item';
import { FragmentList } from '../domain/fragment-list';
import { TWithId } from '../domain/types/common/with-id';

export class TrackedItemsListRepo implements ITrackedItemsListRepo {
    private items: Map<TTrackedItemUniqueId, TWithId<TTrackedItemState>> = new Map();
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
            const setList = JSON.parse(raw) as { items: TWithId<TTrackedItemState>[] };
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

    async addMany(items: TTrackedItemState[]): Promise<void> {
        for (const item of items) {
            const id = this.uniqueIdGenerator.generate();
            this.items.set(id, { ...item, id });
        }
        await this.persist();
    }

    async create(item: Omit<TTrackedItemState, 'id'>): Promise<TrackedItem> {
        const id = this.uniqueIdGenerator.generate();
        const state: TWithId<TTrackedItemState> = { ...item, id };
        this.items.set(id, state);
        await this.persist();
        return this.mapToDomain(state);
    }

    async updateOne(item: TrackedItem): Promise<void> {
        if (!this.items.has(item.id)) {
            throw new Error(`Item with id ${item.id} not found`);
        }
        this.items.set(item.id, { ...item.getState(), id: item.id });
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

    private mapToDomain(state: TWithId<TTrackedItemState>): TrackedItem {
        return new TrackedItem(
            state.id,
            state.artistName,
            state.title,
            FragmentList.fromState(state.fragments)
        );
    }
}