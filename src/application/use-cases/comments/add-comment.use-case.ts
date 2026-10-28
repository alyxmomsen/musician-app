import { Comment, TCommentTarget } from '../../../domain/comment';
import { ICommentsRepo } from '../../../domain/ports/comments-repo';
import { IUniqueIdGenerator } from '../../../domain/ports/uniqueIdGenerator';

export class AddCommentUseCase {
    constructor(
        private commentsRepo: ICommentsRepo,
        private idGenerator: IUniqueIdGenerator
    ) {}

    async execute(text: string, target: TCommentTarget): Promise<Comment> {
        const trimmed = text.trim();
        if (!trimmed) {
            throw new Error('Comment text cannot be empty');
        }
        const id = this.idGenerator.generate();
        const comment = new Comment(id, trimmed, target, Date.now());
        await this.commentsRepo.create(comment);
        return comment;
    }
}