import { TCommentTarget } from '../../domain/comment/models/comment.entity';

export interface CommentDto {
  id: string;
  text: string;
  target: TCommentTarget;
  authorId: string;
  createdAt: number;
}