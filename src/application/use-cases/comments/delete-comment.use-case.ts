import { ICommentsRepo } from '../../../domain/ports/comments-repo';
import { ITagLinksRepo } from '../../../domain/ports/tag-links-repo';

export class DeleteCommentUseCase {
    constructor(
        private commentsRepo: ICommentsRepo,
        private tagLinksRepo: ITagLinksRepo
    ) {}

    async execute(id: string): Promise<void> {
        await this.tagLinksRepo.deleteByTarget({
            type: 'comment',
            commentId: id,
        });
        await this.commentsRepo.delete(id);
    }
}
