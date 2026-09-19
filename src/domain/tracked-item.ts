import {
    TrackedItemTextFragment,
    TTrackedItemTextFragmentDTO,
} from './tracked-item-fragment';

export type TTrackedItemDTO = {
    originalArtistName: string;
    title: string;
    progressPercentage: number;
    fragments: TTrackedItemTextFragmentDTO[];
};

export type TTrackedItemDTOWithId = { id: string } & TTrackedItemDTO;

export type TTrackItemUniqueId = string;

export class TrackedItem {
    constructor(
        readonly id: string,
        private originalArtistName: string,
        private title: string,
        private progressPercentage: number = 0,
        private fragments: TrackedItemTextFragment[] = []
    ) {}

    incrementProgress(amount: number) {
        if (this.progressPercentage + amount > 100) {
            this.progressPercentage = 100.0;
            return;
        }

        this.progressPercentage += amount;
    }

    decrementProgress(amount: number) {
        if (this.progressPercentage - amount < 0) {
            this.progressPercentage = 0;
            return;
        }

        this.progressPercentage -= amount;
    }

    setTitle(title: string) {
        this.title = title;
    }

    getTitle() {
        return this.title;
    }

    getArtistName() {
        return this.originalArtistName;
    }

    getProgress() {
        return this.progressPercentage;
    }

    getDTO(): TTrackedItemDTOWithId {
        return {
            id: this.id,
            originalArtistName: this.getArtistName(),
            title: this.getTitle(),
            progressPercentage: this.getProgress(),
            fragments: this.fragments.map((f) => f.getDTO()),
        };
    }

    getFragments(): TrackedItemTextFragment[] {
        return this.fragments;
    }

    setFragmentDone(index: number, done: boolean): void {
        const fragment = this.fragments[index];
        if (!fragment) throw new Error(`Fragment ${index} not found`);
        done ? fragment.done() : fragment.unDone();
    }
}
