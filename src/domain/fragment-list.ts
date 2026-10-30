import {
    TrackedItemTextFragment,
    TTrackedItemTextFragmentState,
} from './tracked-item-fragment';
import { TUniqueId } from './types/unique-id';

export interface FragmentsCompletionSummary {
    total: number;
    completed: number;
}

export class FragmentList {
    private fragments: TrackedItemTextFragment[];

    constructor(fragments: TrackedItemTextFragment[] = []) {
        this.fragments = [...fragments];
    }

    // ---------- Чтение ----------

    getAll(): readonly TrackedItemTextFragment[] {
        return this.fragments;
    }

    getById(id: TUniqueId): TrackedItemTextFragment | null {
        return this.fragments.find((f) => f.id === id) ?? null;
    }

    get length(): number {
        return this.fragments.length;
    }

    isEmpty(): boolean {
        return this.fragments.length === 0;
    }

    // ---------- Мутации ----------

    add(
        input: {
            id: TUniqueId;
            text: string;
            title?: string;
            isDone?: boolean;
        },
        position?: number
    ): void {
        const fragment = new TrackedItemTextFragment(
            input.id,
            input.text,
            input.title ?? '',
            input.isDone ?? false
        );

        if (position === undefined || position >= this.fragments.length) {
            this.fragments.push(fragment);
            return;
        }
        if (position < 0) {
            throw new Error(`Position ${position} is invalid`);
        }
        this.fragments.splice(position, 0, fragment);
    }

    remove(id: TUniqueId): void {
        const index = this.indexOf(id);
        if (index === -1) {
            throw new Error(`Fragment ${id} not found`);
        }
        this.fragments.splice(index, 1);
    }

    setDone(id: TUniqueId, done: boolean): void {
        const fragment = this.getOrThrow(id);
        if (done) fragment.done();
        else fragment.unDone();
    }

    markReviewed(id: TUniqueId, timestamp: number): void {
        this.getOrThrow(id).markReviewed(timestamp);
    }

    renameTitle(id: TUniqueId, title: string): void {
        this.getOrThrow(id).setTitle(title);
    }

    updateFragment(
        id: TUniqueId,
        patch: { text?: string; title?: string }
    ): void {
        const fragment = this.getOrThrow(id);
        if (patch.text !== undefined) fragment.setText(patch.text);
        if (patch.title !== undefined) fragment.setTitle(patch.title);
    }

    splitFragmentBySeparator(
        id: TUniqueId,
        generateId: () => string,
        separator: string = '\n'
    ): void {
        const index = this.indexOf(id);
        if (index === -1) {
            throw new Error(`Fragment ${id} not found`);
        }
        const fragment = this.fragments[index];

        const parts = fragment
            .getText()
            .split(separator)
            .map((s) => s.trim())
            .filter((s) => s.length > 0);

        if (parts.length < 2) {
            return;
        }

        const newFragments = parts.map(
            (text) => new TrackedItemTextFragment(generateId(), text)
        );

        this.fragments.splice(index, 1, ...newFragments);
    }

    merge(
        idA: TUniqueId,
        idB: TUniqueId,
        newId: TUniqueId,
        separator: string = '\n'
    ): void {
        const indexA = this.indexOf(idA);
        const indexB = this.indexOf(idB);

        if (indexA === -1) throw new Error(`Fragment ${idA} not found`);
        if (indexB === -1) throw new Error(`Fragment ${idB} not found`);
        if (indexA === indexB)
            throw new Error('Cannot merge fragment with itself');
        if (Math.abs(indexA - indexB) !== 1) {
            throw new Error('Can only merge adjacent fragments');
        }

        const lo = Math.min(indexA, indexB);
        const hi = Math.max(indexA, indexB);
        const a = this.fragments[lo];
        const b = this.fragments[hi];

        const merged = new TrackedItemTextFragment(
            newId,
            `${a.getText()}${separator}${b.getText()}`,
            '',
            a.isCompleted() && b.isCompleted()
        );

        this.fragments.splice(lo, 2, merged);
    }

    // ---------- Вычисления ----------

    getCompletionSummary(): FragmentsCompletionSummary {
        let total = 0;
        let completed = 0;
        this.fragments.forEach((fr) => {
            total++;
            if (fr.isCompleted()) completed++;
        });
        return { total, completed };
    }

    // ---------- Сериализация ----------

    getState(): TTrackedItemTextFragmentState[] {
        return this.fragments.map((f) => f.getState());
    }

    static fromState(states: TTrackedItemTextFragmentState[]): FragmentList {
        return new FragmentList(
            states.map((s) => TrackedItemTextFragment.fromState(s))
        );
    }

    // ---------- Приватное ----------

    private getOrThrow(id: TUniqueId): TrackedItemTextFragment {
        const fragment = this.getById(id);
        if (!fragment) {
            throw new Error(`Fragment ${id} not found`);
        }
        return fragment;
    }

    private indexOf(id: TUniqueId): number {
        return this.fragments.findIndex((f) => f.id === id);
    }
}
