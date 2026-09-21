export type TTrackedItemTextFragmentState = {
    text: string;
    isDone: boolean;
};

export class TrackedItemTextFragment {
    constructor(
        private text: string,
        private isDone: boolean = false
    ) {}

    getText(): string {
        return this.text;
    }

    isCompleted(): boolean {
        return this.isDone;
    }

    done(): void {
        this.isDone = true;
    }

    unDone(): void {
        this.isDone = false;
    }

    getState(): TTrackedItemTextFragmentState {
        return { text: this.text, isDone: this.isDone };
    }
}