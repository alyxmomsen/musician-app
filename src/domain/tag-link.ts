type TUniqueId = string;

export type TTagLinkTarget =
    | {
          type: 'tracked-item';
          trackedItemId: string;
      }
    | {
          type: 'fragment';
          trackedItemId: string;
          fragmentId: string;
      }
    | {
          type: 'comment';
          commentId: string;
      };

export type TTagLinkState = {
    id: TUniqueId;
    tagId: TUniqueId;
    target: TTagLinkTarget;
    createdAt: number;
};

export class TagLink {
    constructor(
        readonly id: TUniqueId,
        readonly tagId: TUniqueId,
        readonly target: TTagLinkTarget,
        readonly createdAt: number
    ) {}

    getState(): TTagLinkState {
        return {
            id: this.id,
            tagId: this.tagId,
            target: this.target,
            createdAt: this.createdAt,
        };
    }

    static fromState(state: TTagLinkState): TagLink {
        return new TagLink(state.id, state.tagId, state.target, state.createdAt);
    }
}