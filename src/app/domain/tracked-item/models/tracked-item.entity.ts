import { TrackedItemTextFragment } from './tracked-item-text-fragment.entity';

export class TrackedItem {
  constructor(
    public readonly id: string,
    private _artistName: string,
    private _title: string,
    private _progress: number,
    private _fragments: TrackedItemTextFragment[] = []
  ) {}

  get artistName(): string {
    return this._artistName;
  }

  get title(): string {
    return this._title;
  }

  get progress(): number {
    return this._progress;
  }

  get fragments(): TrackedItemTextFragment[] {
    return this._fragments;
  }
}