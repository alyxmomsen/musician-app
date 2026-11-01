import { TTagLinkTarget } from '../../domain/tag/models/tag-link.entity';

export interface HashTagDto {
  id: string;
  originalText: string;
  normalizedText: string;
  description: string;
  createdBy: string;
}

export type TagLinkTargetDto = TTagLinkTarget;