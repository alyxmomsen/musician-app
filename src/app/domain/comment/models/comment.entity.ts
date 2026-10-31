export type TCommentTarget =
  | {
      type: 'fragment-range';
      trackedItemId: string;
      fragmentId: string;
      start: number;
      end: number;
      quote: string;
    }
  | { type: 'tag'; tagId: string }
  | { type: 'tracked-item'; trackedItemId: string };

export interface Comment {
  id: string;
  text: string;
  target: TCommentTarget;
  authorId: string;
  createdAt: number;
}