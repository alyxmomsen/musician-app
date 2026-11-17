export type TTagLinkTarget =
  | { type: 'tracked-item'; trackedItemId: string }
  | { type: 'fragment'; trackedItemId: string; fragmentId: string }
  | {
      type: 'fragment-range';
      trackedItemId: string;
      fragmentId: string;
      start: number;
      end: number;
      quote: string;
    }
  | { type: 'comment'; commentId: string };

export interface TagLink {
  id: string;
  tagId: string;
  target: TTagLinkTarget;
  createdAt: number;
}