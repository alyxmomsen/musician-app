import { TUniqueId } from './types/unique-id';

export type TCommentTarget =
    | {
          type: 'fragment-range';
          trackedItemId: string;
          fragmentId: string;
          start: number;
          end: number;
          quote: string;
      }
    | {
          type: 'tag';
          tagId: string;
      }
    | {
          type: 'tracked-item';
          trackedItemId: string;
      };

export type TCommentState = {
    id: TUniqueId;
    text: string;
    target: TCommentTarget;
    authorId: TUniqueId;
    createdAt: number;
};

export class Comment {
    constructor(
        readonly id: TUniqueId,
        private text: string,
        readonly target: TCommentTarget,
        readonly authorId: TUniqueId,
        readonly createdAt: number
    ) {
        if (target.type === 'fragment-range' && target.start >= target.end) {
            throw new Error('Comment range: start must be less than end');
        }
    }

    getText(): string {
        return this.text;
    }

    setText(text: string): void {
        this.text = text;
    }

    getTarget(): TCommentTarget {
        return this.target;
    }

    getCreatedAt(): number {
        return this.createdAt;
    }

    getState(): TCommentState {
        return {
            id: this.id,
            text: this.text,
            target: this.target,
            authorId: this.authorId,
            createdAt: this.createdAt,
        };
    }

    static fromState(state: TCommentState): Comment {
        return new Comment(
            state.id,
            state.text,
            state.target,
            state.authorId,
            state.createdAt
        );
    }
}