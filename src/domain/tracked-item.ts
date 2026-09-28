import { FragmentList, FragmentsCompletionSummary } from './fragment-list';
import {
    TrackedItemTextFragment,
    TTrackedItemTextFragmentState,
} from './tracked-item-fragment';

export type TTrackedItemState = {
    artistName: string;
    title: string;
    fragments: TTrackedItemTextFragmentState[];
};

export type TTrackedItemUniqueId = string;

export class TrackedItem {
    constructor(
        readonly id: TTrackedItemUniqueId,
        private artistName: string,
        private title: string,
        private fragments: FragmentList = new FragmentList()
    ) {}

    // ---------- Метаданные ----------

    getArtistName(): string {
        return this.artistName;
    }

    getTitle(): string {
        return this.title;
    }

    setArtistName(artistName: string): void {
        this.artistName = artistName;
    }

    setTitle(title: string): void {
        this.title = title;
    }

    rename(artistName: string, title: string): void {
        this.artistName = artistName;
        this.title = title;
    }

    // ---------- Фрагменты ----------

    getFragments(): readonly TrackedItemTextFragment[] {
        return this.fragments.getAll();
    }

    addFragment(text: string, position?: number): void {
        this.fragments.add(text, position);
    }

    removeFragment(index: number): void {
        this.fragments.remove(index);
    }

    updateFragmentText(index: number, text: string): void {
        this.fragments.updateText(index, text);
    }

    setFragmentDone(index: number, done: boolean): void {
        this.fragments.setDone(index, done);
    }

    splitFragment(index: number, separator: string = '\n'): void {
        this.fragments.splitFragmentBySeparator(index, separator);
    }

    mergeFragments(indexA: number, indexB: number, separator: string = '\n'): void {
        this.fragments.merge(indexA, indexB, separator);
    }

    // ---------- Прогресс ----------

    getFragmentsCompletionSummary(): FragmentsCompletionSummary {
        return this.fragments.getCompletionSummary();
    }

    calculateProgress(): number {
        const { total, completed } = this.fragments.getCompletionSummary();
        return total > 0 ? (completed / total) * 100 : 0;
    }

    // ---------- Сериализация ----------

    getState(): TTrackedItemState {
        return {
            artistName: this.artistName,
            title: this.title,
            fragments: this.fragments.getState(),
        };
    }

    markFragmentReviewed(index: number, timestamp: number): void {
        this.fragments.markReviewed(index, timestamp);
    }

    renameFragmentTitle(index: number, title: string): void {
        this.fragments.renameTitle(index, title);
    }
}