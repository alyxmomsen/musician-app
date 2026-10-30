import {
    TrackedItem,
    TTrackedItemState,
    TTrackedItemUniqueId,
} from '../tracked-item';

export interface ITrackedItemsListRepo {
    init(): Promise<void>;
    addMany(items: Omit<TTrackedItemState, 'id'>[]): Promise<void>;
    create(item: Omit<TTrackedItemState, 'id'>): Promise<TrackedItem>;
    updateOne(item: TrackedItem): Promise<void>;
    removeOne(id: TTrackedItemUniqueId): Promise<void>;
    findByArtistName(artistName: string): Promise<TrackedItem[]>;
    getAll(): Promise<TrackedItem[]>;
    getById(id: TTrackedItemUniqueId): Promise<TrackedItem | null>;
    getRandom(): Promise<TrackedItem | null>;
}
