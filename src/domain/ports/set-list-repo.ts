import { TrackedItem, TTrackedItemDTO, TTrackedItemDTOWithId, TTrackItemUniqueId } from '../tracked-item';

export interface ITrackedItemListRepo {
    init(): Promise<void>;
    addMany(items: TTrackedItemDTO[]): Promise<void>;
    updateOne(item: TTrackedItemDTOWithId): Promise<void>;
    removeOne(id: TTrackItemUniqueId): Promise<void>;
    findByArtistName(artistName: string): Promise<TrackedItem[]>;
    getAll(): Promise<TrackedItem[]>;
    getById(id: TTrackItemUniqueId): Promise<TrackedItem | null>;
    getRandom(): Promise<TrackedItem | null>;
}
