import {
    TrackedItemTextFragment,
    TTrackedItemTextFragmentState,
} from './tracked-item-fragment';

export interface FragmentsCompletionSummary {
    total: number;
    completed: number;
}

export type TTrackedItemState = {
    id: string;
    artistName: string;
    title: string;
    fragments: TTrackedItemTextFragmentState[];
};

export type TTrackedItemUniqueId = string;

export class TrackedItem {
    constructor(
        readonly id: string,
        private originalArtistName: string,
        private title: string,
        private fragments: TrackedItemTextFragment[] = []
    ) {}

    static fragmentsFromText(text: string): TrackedItemTextFragment[] {
        return text
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line.length > 0)
            .map((line) => new TrackedItemTextFragment(line, false));
    }

    setTitle(title: string): void {
        this.title = title;
    }

    getTitle(): string {
        return this.title;
    }

    getArtistName(): string {
        return this.originalArtistName;
    }

    getFragments(): readonly TrackedItemTextFragment[] {
        return this.fragments;
    }

    getFragmentsCompletionSummary(): FragmentsCompletionSummary {
        let total = 0;
        let completed = 0;
        this.fragments.forEach((fr) => {
            total++;
            if (fr.isCompleted()) completed++;
        });
        return { total, completed };
    }

    calculateProgress(): number {
        const { total, completed } = this.getFragmentsCompletionSummary();
        return total > 0 ? (completed / total) * 100 : 0;
    }

    rename(artistName: string, title: string): void {
        this.originalArtistName = artistName;
        this.title = title;
    }

    addFragment(text: string, position: number): void {
        const fragment = new TrackedItemTextFragment(text, false);
        if (position >= this.fragments.length) {
            this.fragments.push(fragment);
        } else {
            this.fragments.splice(position, 0, fragment);
        }
    }

    removeFragment(index: number): void {
        if (index < 0 || index >= this.fragments.length) {
            throw new Error(`Fragment ${index} not found`);
        }
        this.fragments.splice(index, 1);
    }

    updateFragmentText(index: number, text: string): void {
        const fragment = this.fragments[index];
        if (!fragment) throw new Error(`Fragment ${index} not found`);
        fragment.setText(text);
    }

    setFragmentDone(index: number, done: boolean): void {
        const fragment = this.fragments[index];
        if (!fragment) throw new Error(`Fragment ${index} not found`);
        if (done) fragment.done();
        else fragment.unDone();
    }

    getState(): TTrackedItemState {
        return {
            id: this.id,
            artistName: this.originalArtistName,
            title: this.title,
            fragments: this.fragments.map((f) => f.getState()),
        };
    }
}