import { readFile, writeFile } from 'fs/promises';
import { resolve, normalize } from 'path';
import { TUniqueId } from '../domain/user';
import { ICredentialsRepo, TCredentialsState } from '../domain/ports/credentials-repo';

export class JsonCredentialsRepo implements ICredentialsRepo {
    private items: Map<TUniqueId, TCredentialsState> = new Map();
    private readonly path: string;

    constructor(path: string) {
        this.path = normalize(resolve(path));
    }

    async init(): Promise<void> {
        try {
            const raw = await readFile(this.path, 'utf-8');
            const data = JSON.parse(raw) as { items: TCredentialsState[] };
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

    async save(userId: TUniqueId, email: string, passwordHash: string): Promise<void> {
        this.items.set(userId, { userId, email, passwordHash });
        await this.persist();
    }

    async getByUserId(userId: TUniqueId): Promise<TCredentialsState | null> {
        return this.items.get(userId) ?? null;
    }

    async findByEmail(email: string): Promise<TCredentialsState | null> {
        for (const c of this.items.values()) {
            if (c.email === email) return c;
        }
        return null;
    }

    async updateEmail(userId: TUniqueId, email: string): Promise<void> {
        const c = this.items.get(userId);
        if (!c) throw new Error(`Credentials for ${userId} not found`);
        this.items.set(userId, { ...c, email });
        await this.persist();
    }

    async updatePasswordHash(userId: TUniqueId, passwordHash: string): Promise<void> {
        const c = this.items.get(userId);
        if (!c) throw new Error(`Credentials for ${userId} not found`);
        this.items.set(userId, { ...c, passwordHash });
        await this.persist();
    }

    async delete(userId: TUniqueId): Promise<void> {
        this.items.delete(userId);
        await this.persist();
    }
}