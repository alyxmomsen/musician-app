import { TUniqueId } from './types/unique-id';

export type THashTagState = {
    id: TUniqueId;
    originalText: string;
    normalizedText: string;
    description: string;
    createdBy: TUniqueId;
};

export class HashTag {
    constructor(
        readonly id: TUniqueId,
        readonly originalText: string,
        readonly normalizedText: string,
        private description: string,
        readonly createdBy: TUniqueId
    ) {
        if (!normalizedText) {
            throw new Error('HashTag: normalizedText cannot be empty');
        }
    }

    getDescription(): string {
        return this.description;
    }

    setDescription(description: string): void {
        this.description = description;
    }

    getState(): THashTagState {
        return {
            id: this.id,
            originalText: this.originalText,
            normalizedText: this.normalizedText,
            description: this.description,
            createdBy: this.createdBy,
        };
    }

    static fromState(s: THashTagState): HashTag {
        return new HashTag(
            s.id,
            s.originalText,
            s.normalizedText,
            s.description ?? '',
            s.createdBy ?? ''
        );
    }
}