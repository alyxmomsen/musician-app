export class Loop {
    private lastUpdate: number = 0;
    private timeoutId: NodeJS.Timeout | undefined;

    constructor(
        private updateInterval: number,
        private updateFn: () => Promise<void>
    ) {}

    start(): void {
        this.timeoutId = this.nextFraim();
    }

    stop(): void {
        if (this.timeoutId !== undefined) {
            clearTimeout(this.timeoutId);
        }
    }
    private async update(): Promise<void> {
        await this.updateFn();
        this.timeoutId = this.nextFraim();
    }
    private nextFraim(): NodeJS.Timeout {
        return setTimeout(this.update.bind(this), this.updateInterval);
    }
}
