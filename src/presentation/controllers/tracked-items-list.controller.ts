import { Request, Response, NextFunction } from 'express';
import { MainOrchestrator } from '../../application/main-orchestrator';

interface IdParams {
    id: string;
}

interface FragmentParams {
    id: string;
    fragmentIndex: string;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export class TrackedItemsListController {
    constructor(private readonly orchestrator: MainOrchestrator) {}

    getPage = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = Number(req.query.page ?? DEFAULT_PAGE);
            const limit = Number(req.query.limit ?? DEFAULT_LIMIT);

            if (!Number.isInteger(page) || page < 1) {
                return res
                    .status(400)
                    .json({ error: 'page must be a positive integer' });
            }
            if (
                !Number.isInteger(limit) ||
                limit < 1 ||
                limit > MAX_LIMIT
            ) {
                return res.status(400).json({
                    error: `limit must be between 1 and ${MAX_LIMIT}`,
                });
            }

            const result = await this.orchestrator.getPage(page, limit);

            res.json({
                items: result.items.map((item) => ({
                    id: item.id,
                    artistName: item.getArtistName(),
                    title: item.getTitle(),
                    progress: item.calculateProgress(),
                })),
                total: result.total,
                page,
                limit,
            });
        } catch (err) {
            next(err);
        }
    };

    getById = async (
        req: Request<IdParams>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const item = await this.orchestrator.getById(req.params.id);
            if (!item) {
                return res.status(404).json({ error: 'Item not found' });
            }
            res.json({
                ...item.getState(),
                progress: item.calculateProgress(),
            });
        } catch (err) {
            next(err);
        }
    };

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { artistName, title, text } = req.body as {
                artistName?: string;
                title?: string;
                text?: string;
            };

            if (typeof artistName !== 'string' || artistName.trim() === '') {
                return res
                    .status(400)
                    .json({ error: 'artistName is required' });
            }
            if (typeof title !== 'string' || title.trim() === '') {
                return res.status(400).json({ error: 'title is required' });
            }
            if (typeof text !== 'string') {
                return res.status(400).json({ error: 'text is required' });
            }

            const item = await this.orchestrator.create(
                artistName.trim(),
                title.trim(),
                text
            );

            res.status(201).json({
                ...item.getState(),
                progress: item.calculateProgress(),
            });
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
            const { artistName, title } = req.body as {
                artistName?: string;
                title?: string;
            };

            if (typeof artistName !== 'string' || artistName.trim() === '') {
                return res
                    .status(400)
                    .json({ error: 'artistName is required' });
            }
            if (typeof title !== 'string' || title.trim() === '') {
                return res.status(400).json({ error: 'title is required' });
            }

            const updated = await this.orchestrator.update(
                req.params.id,
                artistName.trim(),
                title.trim()
            );
            if (!updated) {
                return res.status(404).json({ error: 'Item not found' });
            }

            res.json({
                ...updated.getState(),
                progress: updated.calculateProgress(),
            });
        } catch (err) {
            next(err);
        }
    };

    addFragment = async (
        req: Request<IdParams>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { text, position } = req.body as {
                text?: string;
                position?: number;
            };

            if (typeof text !== 'string' || text.trim() === '') {
                return res.status(400).json({ error: 'text is required' });
            }
            if (!Number.isInteger(position) || (position as number) < 0) {
                return res.status(400).json({
                    error: 'position must be a non-negative integer',
                });
            }

            const updated = await this.orchestrator.addFragment(
                req.params.id,
                text.trim(),
                position as number
            );
            if (!updated) {
                return res.status(404).json({ error: 'Item not found' });
            }

            res.json({
                ...updated.getState(),
                progress: updated.calculateProgress(),
            });
        } catch (err) {
            next(err);
        }
    };

    removeFragment = async (
        req: Request<FragmentParams>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const index = Number(req.params.fragmentIndex);
            if (!Number.isInteger(index) || index < 0) {
                return res.status(400).json({
                    error: 'fragmentIndex must be a non-negative integer',
                });
            }

            const updated = await this.orchestrator.removeFragment(
                req.params.id,
                index
            );
            if (!updated) {
                return res.status(404).json({ error: 'Item not found' });
            }

            res.json({
                ...updated.getState(),
                progress: updated.calculateProgress(),
            });
        } catch (err) {
            next(err);
        }
    };

    toggleFragment = async (
        req: Request<FragmentParams>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { id, fragmentIndex } = req.params;
            const { done } = req.body as { done: boolean };
            const index = Number(fragmentIndex);

            if (!Number.isInteger(index) || index < 0) {
                return res.status(400).json({
                    error: 'fragmentIndex must be a non-negative integer',
                });
            }
            if (typeof done !== 'boolean') {
                return res
                    .status(400)
                    .json({ error: 'done must be a boolean' });
            }

            const updated = await this.orchestrator.toggleFragment(
                id,
                index,
                done
            );
            if (!updated) {
                return res.status(404).json({ error: 'Item not found' });
            }

            res.json({
                ...updated.getState(),
                progress: updated.calculateProgress(),
            });
        } catch (err) {
            next(err);
        }
    };
}