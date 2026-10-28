import { Comment, TCommentTarget } from '../../../domain/comment';
import { ICommentsRepo } from '../../../domain/ports/comments-repo';

export class GetCommentsByTargetUseCase {
    constructor(private commentsRepo: ICommentsRepo) {}

    execute(target: TCommentTarget): Promise<Comment[]> {
        return this.commentsRepo.getByTarget(target);
    }
}