import { Request, Response, NextFunction } from 'express';
import { CommentsOrchestrator } from '../../application/comments-orchestrator';
import { TCommentTarget } from '../../domain/comment';

interface IdParams {
    id: string;
}

export class CommentsController {
    constructor(private readonly orchestrator: CommentsOrchestrator) {}

    getByTrackedItem = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const trackedItemId = req.query.trackedItemId as string | undefined;
            if (!trackedItemId) {
                return res
                    .status(400)
                    .json({ error: 'trackedItemId query is required' });
            }
            const comments = await this.orchestrator.getByTrackedItem(
                trackedItemId
            );
            res.json(comments.map((c) => c.getState()));
        } catch (err) {
            next(err);
        }
    };

    getByTarget = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const target = req.body.target as TCommentTarget | undefined;
            if (!target || typeof target !== 'object' || !target.type) {
                return res
                    .status(400)
                    .json({ error: 'target is required in body' });
            }
            const comments = await this.orchestrator.getByTarget(target);
            res.json(comments.map((c) => c.getState()));
        } catch (err) {
            next(err);
        }
    };

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { text, target } = req.body as {
                text?: string;
                target?: TCommentTarget;
            };
            if (typeof text !== 'string' || text.trim() === '') {
                return res.status(400).json({ error: 'text is required' });
            }
            if (!target || typeof target !== 'object' || !target.type) {
                return res.status(400).json({ error: 'target is required' });
            }
            const comment = await this.orchestrator.add(text, target);
            res.status(201).json(comment.getState());
        } catch (err) {
            next(err);
        }
    };

    update = async (
        req: Request<IdParams>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { text } = req.body as { text?: string };
            if (typeof text !== 'string' || text.trim() === '') {
                return res.status(400).json({ error: 'text is required' });
            }
            const comment = await this.orchestrator.update(
                req.params.id,
                text
            );
            if (!comment) {
                return res.status(404).json({ error: 'Comment not found' });
            }
            res.json(comment.getState());
        } catch (err) {
            next(err);
        }
    };

    remove = async (
        req: Request<IdParams>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            await this.orchestrator.delete(req.params.id);
            res.status(204).send();
        } catch (err) {
            next(err);
        }
    };
}