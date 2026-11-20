import { TrackedItem } from '../models/tracked-item.entity';

export interface TrackedItemsPage {
  items: TrackedItem[];
  total: number;
  page: number;
  limit: number;
}

export interface TrackedItemSearchParams {
  q?: string;
  artist?: string;
  tags?: string[];
  tagIds?: string[];
  page: number;
  limit: number;
}

export interface TrackedItemSearchResult extends TrackedItemsPage {
  /** Tag labels that matched the filter, per item id — optional UI hint */
  matchedTagsByItemId?: Record<string, string[]>;
}

export interface TTrackedItemFragmentInput {
  text: string;
  title: string;
  isDone: boolean;
}

export interface TrackedItemRepositoryPort {
  getPage(page: number, limit: number): Promise<TrackedItemsPage>;
  search(params: TrackedItemSearchParams): Promise<TrackedItemSearchResult>;
  getById(id: string): Promise<TrackedItem>;
  create(
    artistName: string,
    title: string,
    fragments: TTrackedItemFragmentInput[]
  ): Promise<TrackedItem>;
  update(id: string, artistName: string, title: string): Promise<TrackedItem>;
  addFragment(
    id: string,
    fragment: TTrackedItemFragmentInput,
    position: number
  ): Promise<TrackedItem>;
  removeFragment(id: string, fragmentId: string): Promise<TrackedItem>;
  toggleFragment(
    id: string,
    fragmentId: string,
    done: boolean
  ): Promise<TrackedItem>;
  markFragmentReviewed(id: string, fragmentId: string): Promise<TrackedItem>;
  updateFragment(
    id: string,
    fragmentId: string,
    patch: { text?: string; title?: string }
  ): Promise<TrackedItem>;
  delete(id: string): Promise<void>;
}