import { Request, Response, NextFunction } from 'express';
import { TagsOrchestrator } from '../../application/tags-orchestrator';
import { TTagLinkTarget } from '../../domain/tag-link';

import { IAuthRequest } from '../../infrastructure/express/middleware/auth.middleware';

interface IdParams {
    id: string;
}

export class TagsController {
    constructor(private readonly orchestrator: TagsOrchestrator) {}

    getAll = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const tags = await this.orchestrator.getAll();
            res.json(tags.map((t) => t.getState()));
        } catch (err) {
            next(err);
        }
    };

    getForTarget = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const target = req.body.target as TTagLinkTarget | undefined;
            if (!target || typeof target !== 'object' || !target.type) {
                return res
                    .status(400)
                    .json({ error: 'target is required in body' });
            }
            const tags = await this.orchestrator.getForTarget(target);
            res.json(tags.map((t) => t.getState()));
        } catch (err) {
            next(err);
        }
    };

    getTargetsForTag = async (
        req: Request<IdParams>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const targets = await this.orchestrator.getTargetsForTag(
                req.params.id
            );
            res.json(targets);
        } catch (err) {
            next(err);
        }
    };

    add = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { tagText, target, description } = req.body as {
                tagText?: string;
                target?: TTagLinkTarget;
                description?: string;
            };
            if (typeof tagText !== 'string' || tagText.trim() === '') {
                return res.status(400).json({ error: 'tagText is required' });
            }
            if (/\s/.test(tagText.trim())) {
                return res.status(400).json({
                    error: 'tagText must not contain whitespace; split tags on client',
                });
            }
            if (!target || typeof target !== 'object' || !target.type) {
                return res.status(400).json({ error: 'target is required' });
            }
            const authorId = (req as IAuthRequest).userId;
            if (!authorId) return res.status(401).json({ error: 'Unauthorized' });

            const desc = typeof description === 'string' ? description : '';
            const { tag } = await this.orchestrator.add(
                tagText,
                target,
                authorId,
                desc
            );
            res.status(201).json(tag.getState());
        } catch (err) {
            next(err);
        }
    };

    remove = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { tagId, target } = req.body as {
                tagId?: string;
                target?: TTagLinkTarget;
            };
            if (typeof tagId !== 'string') {
                return res.status(400).json({ error: 'tagId is required' });
            }
            if (!target || typeof target !== 'object' || !target.type) {
                return res.status(400).json({ error: 'target is required' });
            }
            await this.orchestrator.remove(tagId, target);
            res.status(204).send();
        } catch (err) {
            next(err);
        }
    };

    removeTag = async (
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

    getForTrackedItem = async (
        req: Request<{ id: string }>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const result = await this.orchestrator.getForTrackedItem(
                req.params.id
            );
            res.json(
                result.map((r) => ({
                    tag: r.tag.getState(),
                    target: r.target,
                }))
            );
        } catch (err) {
            next(err);
        }
    };

    updateDescription = async (
        req: Request<IdParams>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { description } = req.body as { description?: string };

            if (typeof description !== 'string') {
                return res.status(400).json({ error: 'description is required' });
            }

            const userId = (req as unknown as IAuthRequest).userId;

            if (!userId) return res.status(401).json({ error: 'Unauthorized' });

            const tag = await this.orchestrator.updateDescription(
                req.params.id,
                description,
                userId
            );
            res.json(tag.getState());
        } catch (err) {
            if (err instanceof Error) {
                if (err.message === 'Tag not found') {
                    return res.status(404).json({ error: err.message });
                }
                if (err.message.includes('Only the tag author')) {
                    return res.status(403).json({ error: err.message });
                }
                return res.status(400).json({ error: err.message });
            }
            next(err);
        }
    };
}
