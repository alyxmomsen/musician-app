import { ReviewedAt } from './reviewed-at';
import { TUniqueId } from './types/unique-id';

export type TTrackedItemTextFragmentState = {
    id: TUniqueId;
    text: string;
    title: string;
    isDone: boolean;
    lastReviewedAt: number | null;
};

export class TrackedItemTextFragment {
    constructor(
        readonly id: TUniqueId,
        private text: string,
        private title: string = '',
        private isDone: boolean = false,
        private lastReviewedAt: ReviewedAt | null = null
    ) {}

    // ---------- Текст ---------

    getText(): string {
        return this.text;
    }

    setText(text: string): void {
        this.text = text;
    }

    // ---------- Название ----------

    getTitle(): string {
        return this.title;
    }

    setTitle(title: string): void {
        this.title = title;
    }

    // ---------- Выполнение ----------

    isCompleted(): boolean {
        return this.isDone;
    }

    done(): void {
        this.isDone = true;
    }

    unDone(): void {
        this.isDone = false;
    }

    // ---------- Повторение ----------

    getReviewedAt(): ReviewedAt | null {
        return this.lastReviewedAt;
    }

    markReviewed(timestamp: number): void {
        this.lastReviewedAt = new ReviewedAt(timestamp);
    }

    isNeverReviewed(): boolean {
        return this.lastReviewedAt === null;
    }

    // ---------- Сериализация ----------

    getState(): TTrackedItemTextFragmentState {
        return {
            id: this.id,
            text: this.text,
            title: this.title,
            isDone: this.isDone,
            lastReviewedAt: this.lastReviewedAt?.getValue() ?? null,
        };
    }

    static fromState(
        state: TTrackedItemTextFragmentState
    ): TrackedItemTextFragment {
        return new TrackedItemTextFragment(
            state.id,
            state.text,
            state.title,
            state.isDone,
            state.lastReviewedAt === null
                ? null
                : ReviewedAt.fromState(state.lastReviewedAt)
        );
    }
}
