import { HashTag } from '../../tag/models/hash-tag.entity';

export type TCommentTarget =
  | {
      type: 'fragment-range';
      trackedItemId: string;
      fragmentId: string;
      start: number;
      end: number;
      quote: string;
    }
  | { type: 'fragment'; trackedItemId: string; fragmentId: string }
  | { type: 'tracked-item'; trackedItemId: string };

export interface Comment {
  id: string;
  text: string;
  target: TCommentTarget;
  authorId: string;
  createdAt: number;
}

export interface IAnnotationResult {
  comment: Comment | null;
  tags: HashTag[];
}