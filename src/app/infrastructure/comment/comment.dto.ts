import { TCommentTarget } from '../../domain/comment/models/comment.entity';
import { HashTagDto } from '../tag/tag.dto';

export interface CommentDto {
  id: string;
  text: string;
  target: TCommentTarget;
  authorId: string;
  createdAt: number;
}

export interface AnnotationResponseDto {
  comment: CommentDto | null;
  tags: HashTagDto[];
}