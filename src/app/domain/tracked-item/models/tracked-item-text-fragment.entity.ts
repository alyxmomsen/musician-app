export class TrackedItemTextFragment {
  constructor(
    public readonly id: string,
    private _text: string,
    private _title: string = '',
    private _isDone: boolean = false,
    private _lastReviewedAt: number | null = null
  ) {}

  get text(): string { return this._text; }
  get title(): string { return this._title; }
  get isDone(): boolean { return this._isDone; }
  get lastReviewedAt(): number | null { return this._lastReviewedAt; }

  markDone(): void { this._isDone = true; }
  markUndone(): void { this._isDone = false; }
}