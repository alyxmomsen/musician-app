import { readFile, writeFile } from 'fs/promises';
import { resolve, normalize } from 'path';
import { HashTag, THashTagState } from '../domain/hash-tag';
import { ITagsRepo } from '../domain/ports/tags-repo';
import { TUniqueId } from '../domain/types/unique-id';

export class JsonTagsRepo implements ITagsRepo {
    private items: Map<TUniqueId, THashTagState> = new Map();
    private readonly path: string;

    constructor(path: string) {
        this.path = normalize(resolve(path));
    }

    async init(): Promise<void> {
        try {
            const raw = await readFile(this.path, 'utf-8');
            const data = JSON.parse(raw) as { items: THashTagState[] };
            data.items.forEach((item) => {
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

    async create(tag: HashTag): Promise<void> {
        this.items.set(tag.id, tag.getState());
        await this.persist();
    }

    async getById(id: TUniqueId): Promise<HashTag | null> {
        const state = this.items.get(id);
        if (state === undefined) return null;
        return HashTag.fromState(state);
    }

    async getByNormalizedText(normalizedText: string): Promise<HashTag | null> {
        for (const state of this.items.values()) {
            if (state.normalizedText === normalizedText) {
                return HashTag.fromState(state);
            }
        }
        return null;
    }

    async getAll(): Promise<HashTag[]> {
        return Array.from(this.items.values()).map((s) => HashTag.fromState(s));
    }

    async delete(id: TUniqueId): Promise<void> {
        this.items.delete(id);
        await this.persist();
    }
}