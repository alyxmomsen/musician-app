import {
    TrackedItemTextFragment,
    TTrackedItemTextFragmentState,
} from './tracked-item-fragment';

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

    getAt(index: number): TrackedItemTextFragment {
        const fragment = this.fragments[index];
        if (!fragment) {
            throw new Error(`Fragment ${index} not found`);
        }
        return fragment;
    }

    get length(): number {
        return this.fragments.length;
    }

    isEmpty(): boolean {
        return this.fragments.length === 0;
    }

    // ---------- Мутации ----------

    add(text: string, position?: number): void {
        const fragment = new TrackedItemTextFragment(text);

        if (position === undefined || position >= this.fragments.length) {
            this.fragments.push(fragment);
            return;
        }
        if (position < 0) {
            throw new Error(`Position ${position} is invalid`);
        }
        this.fragments.splice(position, 0, fragment);
    }

    remove(index: number): void {
        this.assertIndex(index);
        this.fragments.splice(index, 1);
    }

    updateText(index: number, text: string): void {
        this.getAt(index).setText(text);
    }

    setDone(index: number, done: boolean): void {
        const fragment = this.getAt(index);
        if (done) fragment.done();
        else fragment.unDone();
    }

    splitFragmentBySeparator(index: number, separator: string = '\n'): void {
        const fragment = this.getAt(index);

        const parts = fragment
            .getText()
            .split(separator)
            .map((s) => s.trim())
            .filter((s) => s.length > 0);

        if (parts.length < 2) {
            return;
        }

        const newFragments = parts.map(
            (text) => new TrackedItemTextFragment(text)
        );

        this.fragments.splice(index, 1, ...newFragments);
    }

    merge(indexA: number, indexB: number, separator: string = '\n'): void {
        this.assertIndex(indexA);
        this.assertIndex(indexB);

        if (indexA === indexB) {
            throw new Error('Cannot merge fragment with itself');
        }
        if (Math.abs(indexA - indexB) !== 1) {
            throw new Error('Can only merge adjacent fragments');
        }

        const lo = Math.min(indexA, indexB);
        const hi = Math.max(indexA, indexB);
        const a = this.getAt(lo);
        const b = this.getAt(hi);

        const merged = new TrackedItemTextFragment(
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
        return new FragmentList(states.map((s) => TrackedItemTextFragment.fromState(s)));
    }

    static fromText(text: string): FragmentList {
        const fragments = text
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line.length > 0)
            .map((line) => new TrackedItemTextFragment(line));

        return new FragmentList(fragments);
    }

    // ---------- Приватное ----------

    private assertIndex(index: number): void {
        if (
            !Number.isInteger(index) ||
            index < 0 ||
            index >= this.fragments.length
        ) {
            throw new Error(`Fragment ${index} not found`);
        }
    }


    markReviewed(index: number, timestamp: number): void {
    this.getAt(index).markReviewed(timestamp);
}

    renameTitle(index: number, title: string): void {
        this.getAt(index).setTitle(title);
    }
}