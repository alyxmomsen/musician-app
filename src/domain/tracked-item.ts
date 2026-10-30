import { FragmentList, FragmentsCompletionSummary } from './fragment-list';
import {
    TrackedItemTextFragment,
    TTrackedItemTextFragmentState,
} from './tracked-item-fragment';
import { TUniqueId } from './types/unique-id';

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

    addFragment(
        input: {
            id: TUniqueId;
            text: string;
            title?: string;
            isDone?: boolean;
        },
        position?: number
    ): void {
        this.fragments.add(input, position);
    }

    removeFragment(id: TUniqueId): void {
        this.fragments.remove(id);
    }

    setFragmentDone(id: TUniqueId, done: boolean): void {
        this.fragments.setDone(id, done);
    }

    splitFragment(
        id: TUniqueId,
        generateId: () => string,
        separator: string = '\n'
    ): void {
        this.fragments.splitFragmentBySeparator(id, generateId, separator);
    }

    mergeFragments(
        idA: TUniqueId,
        idB: TUniqueId,
        newId: TUniqueId,
        separator: string = '\n'
    ): void {
        this.fragments.merge(idA, idB, newId, separator);
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

    markFragmentReviewed(id: TUniqueId, timestamp: number): void {
        this.fragments.markReviewed(id, timestamp);
    }

    renameFragmentTitle(id: TUniqueId, title: string): void {
        this.fragments.renameTitle(id, title);
    }

    updateFragment(
        id: TUniqueId,
        patch: { text?: string; title?: string }
    ): void {
        this.fragments.updateFragment(id, patch);
    }
}
