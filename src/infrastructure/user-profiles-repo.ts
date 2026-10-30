import { readFile, writeFile } from 'fs/promises';
import { resolve, normalize } from 'path';
import { TUniqueId } from '../domain/user';
import { IUserProfilesRepo, TUserProfileState } from '../domain/ports/user-profiles-repo';

export class JsonUserProfilesRepo implements IUserProfilesRepo {
    private items: Map<TUniqueId, TUserProfileState> = new Map();
    private readonly path: string;

    constructor(path: string) {
        this.path = normalize(resolve(path));
    }

    async init(): Promise<void> {
        try {
            const raw = await readFile(this.path, 'utf-8');
            const data = JSON.parse(raw) as { items: TUserProfileState[] };
            data.items.forEach((item) => this.items.set(item.userId, item));
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

    async save(userId: TUniqueId, displayName: string): Promise<void> {
        this.items.set(userId, { userId, displayName });
        await this.persist();
    }

    async getByUserId(userId: TUniqueId): Promise<TUserProfileState | null> {
        return this.items.get(userId) ?? null;
    }

    async getByUserIds(userIds: TUniqueId[]): Promise<Map<TUniqueId, TUserProfileState>> {
        const result = new Map<TUniqueId, TUserProfileState>();
        for (const id of userIds) {
            const p = this.items.get(id);
            if (p) result.set(id, p);
        }
        return result;
    }

    async getByDisplayName(displayName: string): Promise<TUserProfileState | null> {
        for (const p of this.items.values()) {
            if (p.displayName === displayName) return p;
        }
        return null;
    }

    async updateDisplayName(userId: TUniqueId, displayName: string): Promise<void> {
        const p = this.items.get(userId);
        if (!p) throw new Error(`Profile for ${userId} not found`);
        this.items.set(userId, { ...p, displayName });
        await this.persist();
    }

    async delete(userId: TUniqueId): Promise<void> {
        this.items.delete(userId);
        await this.persist();
    }
}