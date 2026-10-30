import { Comment } from '../../../domain/comment';
import { ICommentsRepo } from '../../../domain/ports/comments-repo';

export class GetCommentsByTrackedItemUseCase {
    constructor(private commentsRepo: ICommentsRepo) {}

    execute(trackedItemId: string): Promise<Comment[]> {
        return this.commentsRepo.getByTrackedItem(trackedItemId);
    }
}
