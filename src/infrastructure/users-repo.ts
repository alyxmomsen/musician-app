import { readFile, writeFile } from 'fs/promises';
import { resolve, normalize } from 'path';
import { User, TUserState, TUniqueId } from '../domain/user';
import { IUsersRepo } from '../domain/ports/users-repo';

export class JsonUsersRepo implements IUsersRepo {
    private items: Map<TUniqueId, TUserState> = new Map();
    private readonly path: string;

    constructor(path: string) {
        this.path = normalize(resolve(path));
    }

    async init(): Promise<void> {
        try {
            const raw = await readFile(this.path, 'utf-8');
            const data = JSON.parse(raw) as { items: TUserState[] };
            data.items.forEach((item) => this.items.set(item.id, item));
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

    async create(user: User): Promise<void> {
        this.items.set(user.id, user.getState());
        await this.persist();
    }

    async getById(id: TUniqueId): Promise<User | null> {
        const s = this.items.get(id);
        return s ? User.fromState(s) : null;
    }

    async getAll(): Promise<User[]> {
        return Array.from(this.items.values()).map((s) => User.fromState(s));
    }

    async update(user: User): Promise<void> {
        if (!this.items.has(user.id)) {
            throw new Error(`User ${user.id} not found`);
        }
        this.items.set(user.id, user.getState());
        await this.persist();
    }

    async delete(id: TUniqueId): Promise<void> {
        this.items.delete(id);
        await this.persist();
    }

    async count(): Promise<number> {
        return this.items.size;
    }
}