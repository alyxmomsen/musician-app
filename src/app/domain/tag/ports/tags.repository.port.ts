import { HashTag } from '../models/hash-tag.entity';
import { TTagLinkTarget } from '../models/tag-link.entity';

export interface TagsRepositoryPort {
  getAll(): Promise<HashTag[]>;
  getForTarget(target: TTagLinkTarget): Promise<HashTag[]>;
  getTargetsForTag(tagId: string): Promise<TTagLinkTarget[]>;
  getForTrackedItem(
    trackedItemId: string
  ): Promise<Array<{ tag: HashTag; target: TTagLinkTarget }>>;
  add(tagText: string, target: TTagLinkTarget): Promise<HashTag>;
  remove(tagId: string, target: TTagLinkTarget): Promise<void>;
  deleteTag(tagId: string): Promise<void>;
}