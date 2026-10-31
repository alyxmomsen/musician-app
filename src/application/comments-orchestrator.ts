import { Comment, TCommentTarget } from '../domain/comment';
import { AddCommentUseCase } from './use-cases/comments/add-comment.use-case';
import { UpdateCommentUseCase } from './use-cases/comments/update-comment.use-case';
import { DeleteCommentUseCase } from './use-cases/comments/delete-comment.use-case';
import { GetCommentsByTargetUseCase } from './use-cases/comments/get-comments-by-target.use-case';
import { GetCommentsByTrackedItemUseCase } from './use-cases/comments/get-comments-by-tracked-item.use-case';

export class CommentsOrchestrator {
    constructor(
        private addCommentUseCase: AddCommentUseCase,
        private updateCommentUseCase: UpdateCommentUseCase,
        private deleteCommentUseCase: DeleteCommentUseCase,
        private getByTargetUseCase: GetCommentsByTargetUseCase,
        private getByTrackedItemUseCase: GetCommentsByTrackedItemUseCase
    ) {}

    async add(
        text: string,
        target: TCommentTarget,
        authorId: string
    ): Promise<Comment> {
        return this.addCommentUseCase.execute(text, target, authorId);
    }

    async update(id: string, text: string): Promise<Comment | null> {
        return this.updateCommentUseCase.execute(id, text);
    }

    async delete(id: string): Promise<void> {
        return this.deleteCommentUseCase.execute(id);
    }

    async getByTarget(target: TCommentTarget): Promise<Comment[]> {
        return this.getByTargetUseCase.execute(target);
    }

    async getByTrackedItem(trackedItemId: string): Promise<Comment[]> {
        return this.getByTrackedItemUseCase.execute(trackedItemId);
    }
}
