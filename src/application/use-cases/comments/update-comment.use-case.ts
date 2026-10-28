import { Comment } from '../../../domain/comment';
import { ICommentsRepo } from '../../../domain/ports/comments-repo';

export class UpdateCommentUseCase {
    constructor(private commentsRepo: ICommentsRepo) {}

    async execute(id: string, text: string): Promise<Comment | null> {
        const trimmed = text.trim();
        if (!trimmed) {
            throw new Error('Comment text cannot be empty');
        }
        const comment = await this.commentsRepo.getById(id);
        if (!comment) return null;
        comment.setText(trimmed);
        await this.commentsRepo.update(comment);
        return comment;
    }
}