import { readFile, writeFile } from 'fs/promises';
import { resolve, normalize } from 'path';
import { IUniqueIdGenerator } from '../domain/ports/uniqueIdGenerator';
import { ITrackedItemListRepo } from '../domain/ports/set-list-repo';
import { TrackedItem, TTrackedItemDTO, TTrackedItemDTOWithId, TTrackItemUniqueId } from '../domain/tracked-item';
import { TrackedItemTextFragment } from '../domain/tracked-item-fragment';

export class SetListRepo implements ITrackedItemListRepo {
    private items: Map<TTrackItemUniqueId, TTrackedItemDTOWithId> = new Map();
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
            const setList = JSON.parse(raw) as {
                items: TTrackedItemDTOWithId[];
            };
            setList.items.forEach((item) => {
                this.items.set(item.id, item);
            });
        } catch {
            this.items = new Map();
        }
    }

    private async persist(): Promise<void> {
        // console.log('persist');
        const serialized = JSON.stringify(
            { items: Array.from(this.items.values()) },
            null,
            2
        );
        await writeFile(this.path, serialized, 'utf-8');
    }

    async addMany(items: TTrackedItemDTO[]): Promise<void> {
        for (const li of items) {
            const id = this.uniqueIdGenerator.generate();
            this.items.set(id, { id, ...li });
        }
        await this.persist();

        // const fragments = (await this.getAll()).map(el => el.getFragments())
        // console.log({fragments:JSON.stringify(fragments)});
    }

    async updateOne(item: TTrackedItemDTOWithId): Promise<void> {
        if (!this.items.has(item.id)) {
            throw new Error(`Item with id ${item.id} not found`);
        }
        this.items.set(item.id, item);
        await this.persist();
    }

    async removeOne(id: TTrackItemUniqueId): Promise<void> {
        this.items.delete(id);
        await this.persist();
    }

    async findByArtistName(artistName: string): Promise<TrackedItem[]> {
        return Array.from(this.items.values())
            .filter((item) => item.originalArtistName === artistName)
            .map((li) => this.convertToListItem(li));
    }

    async getAll(): Promise<TrackedItem[]> {
        return Array.from(this.items.values()).map((li) =>
            this.convertToListItem(li)
        );
    }

    async getById(id: TTrackItemUniqueId): Promise<TrackedItem | null> {
        const li = this.items.get(id);
        if (li === undefined) return null;
        return this.convertToListItem(li);
    }

    async getRandom(): Promise<TrackedItem | null> {
        const arr = Array.from(this.items.values());
        if (arr.length < 1) return null;
        return this.convertToListItem(
            arr[Math.floor(Math.random() * arr.length)]
        );
    }

    private convertToListItem(li: TTrackedItemDTOWithId): TrackedItem {
        return new TrackedItem(
            li.id,
            li.originalArtistName,
            li.title,
            li.progressPercentage,
            (li.fragments ?? []).map(f => new TrackedItemTextFragment(f.text, f.isDone))

        );
    }
}
