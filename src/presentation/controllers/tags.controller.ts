import { Request, Response, NextFunction } from 'express';
import { TagsOrchestrator } from '../../application/tags-orchestrator';
import { TTagLinkTarget } from '../../domain/tag-link';

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
                return res.status(400).json({ error: 'target is required in body' });
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
            const targets = await this.orchestrator.getTargetsForTag(req.params.id);
            res.json(targets);
        } catch (err) {
            next(err);
        }
    };

    add = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { tagText, target } = req.body as {
                tagText?: string;
                target?: TTagLinkTarget;
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
            const { tag } = await this.orchestrator.add(tagText, target);
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
            const result = await this.orchestrator.getForTrackedItem(req.params.id);
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
}