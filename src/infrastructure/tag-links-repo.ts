import { readFile, writeFile } from 'fs/promises';
import { resolve, normalize } from 'path';
import { TagLink, TTagLinkState, TTagLinkTarget } from '../domain/tag-link';
import { ITagLinksRepo } from '../domain/ports/tag-links-repo';
import { TUniqueId } from '../domain/types/unique-id';
import { targetsEqual } from './targets-equal';

export class JsonTagLinksRepo implements ITagLinksRepo {
    private items: Map<TUniqueId, TTagLinkState> = new Map();
    private readonly path: string;

    constructor(path: string) {
        this.path = normalize(resolve(path));
    }

    async init(): Promise<void> {
        try {
            const raw = await readFile(this.path, 'utf-8');
            const data = JSON.parse(raw) as { items: TTagLinkState[] };
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

    async create(link: TagLink): Promise<void> {
        this.items.set(link.id, link.getState());
        await this.persist();
    }

    async getByTagId(tagId: TUniqueId): Promise<TagLink[]> {
        const result: TagLink[] = [];
        for (const state of this.items.values()) {
            if (state.tagId === tagId) {
                result.push(TagLink.fromState(state));
            }
        }
        return result;
    }

    async getByTarget(target: TTagLinkTarget): Promise<TagLink[]> {
        const result: TagLink[] = [];
        for (const state of this.items.values()) {
            if (targetsEqual(state.target, target)) {
                result.push(TagLink.fromState(state));
            }
        }
        return result;
    }

    async delete(id: TUniqueId): Promise<void> {
        this.items.delete(id);
        await this.persist();
    }

    async deleteByTagId(tagId: TUniqueId): Promise<void> {
        for (const [id, state] of this.items.entries()) {
            if (state.tagId === tagId) {
                this.items.delete(id);
            }
        }
        await this.persist();
    }

    async deleteByTarget(target: TTagLinkTarget): Promise<void> {
        for (const [id, state] of this.items.entries()) {
            if (targetsEqual(state.target, target)) {
                this.items.delete(id);
            }
        }
        await this.persist();
    }

    async deleteByTrackedItem(trackedItemId: string): Promise<void> {
        for (const [id, state] of this.items.entries()) {
            const t = state.target;
            if (
                (t.type === 'tracked-item' &&
                    t.trackedItemId === trackedItemId) ||
                (t.type === 'fragment' && t.trackedItemId === trackedItemId)
            ) {
                this.items.delete(id);
            }
        }
        await this.persist();
    }

    async deleteByFragment(fragmentId: string): Promise<void> {
        for (const [id, state] of this.items.entries()) {
            const t = state.target;
            if (t.type === 'fragment' && t.fragmentId === fragmentId) {
                this.items.delete(id);
            }
        }
        await this.persist();
    }

    async getByTrackedItem(trackedItemId: string): Promise<TagLink[]> {
        const result: TagLink[] = [];
        for (const state of this.items.values()) {
            const t = state.target;
            if (
                (t.type === 'tracked-item' &&
                    t.trackedItemId === trackedItemId) ||
                (t.type === 'fragment' && t.trackedItemId === trackedItemId)
            ) {
                result.push(TagLink.fromState(state));
            }
        }
        return result;
    }
}
