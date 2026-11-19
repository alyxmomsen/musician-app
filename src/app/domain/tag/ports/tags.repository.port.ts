import { HashTag } from '../models/hash-tag.entity';
import { TTagLinkTarget } from '../models/tag-link.entity';

export interface TagsRepositoryPort {
  getAll(): Promise<HashTag[]>;
  getForTarget(target: TTagLinkTarget): Promise<HashTag[]>;
  getForTrackedItem(
    trackedItemId: string
  ): Promise<Array<{ linkId: string; tag: HashTag; target: TTagLinkTarget }>>;
  getForComments(commentIds: string[]): Promise<Map<string, HashTag[]>>;
  getTargetsForTag(tagId: string): Promise<TTagLinkTarget[]>;
  add(
    tagText: string,
    target: TTagLinkTarget,
    description?: string
  ): Promise<HashTag>;
  updateDescription(tagId: string, description: string): Promise<HashTag>;
  remove(tagId: string, target: TTagLinkTarget): Promise<void>;
  deleteTag(tagId: string): Promise<void>;
}