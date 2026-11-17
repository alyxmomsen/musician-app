export type TContext =
  | {
      type: 'fragment-range';
      fragmentId: string;
      start: number;
      end: number;
      quote: string;
    }
  | {
      type: 'fragment';
      fragmentId: string;
    }
  | {
      type: 'tracked-item';
    };