import { readFile, writeFile } from 'fs/promises';
import { resolve, normalize } from 'path';
import { Comment, TCommentState, TCommentTarget } from '../domain/comment';
import { ICommentsRepo } from '../domain/ports/comments-repo';
import { TUniqueId } from '../domain/types/unique-id';
import { targetsEqual } from './targets-equal';

export class JsonCommentsRepo implements ICommentsRepo {
    private items: Map<TUniqueId, TCommentState> = new Map();
    private readonly path: string;

    constructor(path: string) {
        this.path = normalize(resolve(path));
    }

    async init(): Promise<void> {
        try {
            const raw = await readFile(this.path, 'utf-8');
            const data = JSON.parse(raw) as { items: TCommentState[] };
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

    async create(comment: Comment): Promise<void> {
        this.items.set(comment.id, comment.getState());
        await this.persist();
    }

    async getById(id: TUniqueId): Promise<Comment | null> {
        const state = this.items.get(id);
        if (state === undefined) return null;
        return Comment.fromState(state);
    }

    async getByTrackedItem(trackedItemId: string): Promise<Comment[]> {
        const result: Comment[] = [];
        for (const state of this.items.values()) {
            const t = state.target;
            if (t.type === 'tracked-item' && t.trackedItemId === trackedItemId) {
                result.push(Comment.fromState(state));
            } else if (
                t.type === 'fragment-range' &&
                t.trackedItemId === trackedItemId
            ) {
                result.push(Comment.fromState(state));
            }
        }
        return result;
    }

    async getByTarget(target: TCommentTarget): Promise<Comment[]> {
        const result: Comment[] = [];
        for (const state of this.items.values()) {
            if (targetsEqual(state.target, target)) {
                result.push(Comment.fromState(state));
            }
        }
        return result;
    }

    async update(comment: Comment): Promise<void> {
        if (!this.items.has(comment.id)) {
            throw new Error(`Comment ${comment.id} not found`);
        }
        this.items.set(comment.id, comment.getState());
        await this.persist();
    }

    async delete(id: TUniqueId): Promise<void> {
        this.items.delete(id);
        await this.persist();
    }

    async deleteByTarget(target: TCommentTarget): Promise<void> {
        for (const [id, state] of this.items.entries()) {
            if (targetsEqual(state.target, target)) {
                this.items.delete(id);
            }
        }
        await this.persist();
    }
}