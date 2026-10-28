import { HashTag } from '../../../domain/hash-tag';
import { ITagsRepo } from '../../../domain/ports/tags-repo';

export class GetAllTagsUseCase {
    constructor(private tagsRepo: ITagsRepo) {}

    execute(): Promise<HashTag[]> {
        return this.tagsRepo.getAll();
    }
}