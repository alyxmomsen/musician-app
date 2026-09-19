import { IUniqueIdGenerator } from '../domain/ports/uniqueIdGenerator';

export class UniqueIdGenerator implements IUniqueIdGenerator {
    constructor() {}
    generate(): string {
        return crypto.randomUUID();
    }
}
