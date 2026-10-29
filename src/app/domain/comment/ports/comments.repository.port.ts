import { Comment, TCommentTarget } from '../models/comment.entity';

export interface CommentsRepositoryPort {
  getByTrackedItem(trackedItemId: string): Promise<Comment[]>;
  getByTarget(target: TCommentTarget): Promise<Comment[]>;
  create(text: string, target: TCommentTarget): Promise<Comment>;
  update(id: string, text: string): Promise<Comment>;
  delete(id: string): Promise<void>;
}