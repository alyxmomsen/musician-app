import { HashTag } from '../hash-tag';
import { TUniqueId } from '../types/unique-id';

export interface ITagsRepo {
    create(tag: HashTag): Promise<void>;
    getById(id: TUniqueId): Promise<HashTag | null>;
    getByNormalizedText(normalizedText: string): Promise<HashTag | null>;
    getAll(): Promise<HashTag[]>;
    update(tag: HashTag): Promise<void>;
    delete(id: TUniqueId): Promise<void>;
}