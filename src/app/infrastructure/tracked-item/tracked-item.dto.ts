export interface TrackedItemSummaryDto {
  id: string;
  artistName: string;
  title: string;
  progress: number;
}

export interface TrackedItemTextFragmentDto {
  id: string;
  text: string;
  title: string;
  isDone: boolean;
  lastReviewedAt: number | null;
}

export interface TrackedItemDetailDto {
  id: string;
  artistName: string;
  title: string;
  progress: number;
  fragments: TrackedItemTextFragmentDto[];
}

export interface TrackedItemsPageDto {
  items: TrackedItemSummaryDto[];
  total: number;
  page: number;
  limit: number;
}