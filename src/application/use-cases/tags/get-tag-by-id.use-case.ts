import { HashTag } from '../../../domain/hash-tag';
import { ITagsRepo } from '../../../domain/ports/tags-repo';

export class GetTagByIdUseCase {
    constructor(private tagsRepo: ITagsRepo) {}

    execute(id: string): Promise<HashTag | null> {
        return this.tagsRepo.getById(id);
    }
}