export class ReviewedAt {
    constructor(private readonly value: number) {
        if (!Number.isFinite(value) || value < 0) {
            throw new Error(`Invalid timestamp: ${value}`);
        }
    }

    getValue(): number {
        return this.value;
    }

    equals(other: ReviewedAt): boolean {
        return this.value === other.value;
    }

    static fromState(value: number): ReviewedAt {
        return new ReviewedAt(value);
    }
}
