type TUniqueId = string;

export type THashTagState = {
    id: TUniqueId;
    originalText: string;
    normalizedText: string;
};

export class HashTag {
    constructor(
        readonly id: TUniqueId,
        readonly originalText: string,
        readonly normalizedText: string
    ) {
        if (!normalizedText) {
            throw new Error('HashTag: normalizedText cannot be empty');
        }
    }

    getState(): THashTagState {
        return {
            id: this.id,
            originalText: this.originalText,
            normalizedText: this.normalizedText,
        };
    }

    static fromState(state: THashTagState): HashTag {
        return new HashTag(state.id, state.originalText, state.normalizedText);
    }
}