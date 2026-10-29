import { Comment, TCommentTarget } from '../comment';
import { TUniqueId } from '../types/unique-id';

export interface ICommentsRepo {
    create(comment: Comment): Promise<void>;
    getById(id: TUniqueId): Promise<Comment | null>;
    getByTrackedItem(trackedItemId: string): Promise<Comment[]>;
    getByTarget(target: TCommentTarget): Promise<Comment[]>;
    update(comment: Comment): Promise<void>;
    delete(id: TUniqueId): Promise<void>;
    deleteByTarget(target: TCommentTarget): Promise<void>;
    deleteByTrackedItem(trackedItemId: string): Promise<void>;
    deleteByFragment(fragmentId: string): Promise<void>;
}