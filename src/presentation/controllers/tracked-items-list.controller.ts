import { Request, Response, NextFunction } from 'express';
import { MainOrchestrator } from '../../application/main-orchestrator';

interface IdParams {
    id: string;
}

interface FragmentParams {
    id: string;
    fragmentId: string;
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
            if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
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
                id: item.id,
                ...item.getState(),
                progress: item.calculateProgress(),
            });
        } catch (err) {
            next(err);
        }
    };

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { artistName, title, fragments } = req.body as {
                artistName?: string;
                title?: string;
                fragments?: Array<{
                    title?: string;
                    text?: string;
                    isDone?: boolean;
                }>;
            };

            if (typeof artistName !== 'string' || artistName.trim() === '') {
                return res.status(400).json({ error: 'artistName is required' });
            }
            if (typeof title !== 'string' || title.trim() === '') {
                return res.status(400).json({ error: 'title is required' });
            }
            if (!Array.isArray(fragments)) {
                return res.status(400).json({ error: 'fragments must be an array' });
            }

            const normalizedFragments = fragments.map((f, i) => {
                if (typeof f.text !== 'string' || f.text.trim() === '') {
                    throw new Error(`fragments[${i}].text is required`);
                }
                return {
                    text: f.text.trim(),
                    title: typeof f.title === 'string' ? f.title.trim() : '',
                    isDone: typeof f.isDone === 'boolean' ? f.isDone : false,
                };
            });

            const item = await this.orchestrator.create(
                artistName.trim(),
                title.trim(),
                normalizedFragments
            );

            res.status(201).json({
                id: item.id,
                ...item.getState(),
                progress: item.calculateProgress(),
            });
        } catch (err) {
            if (err instanceof Error && err.message.startsWith('fragments[')) {
                return res.status(400).json({ error: err.message });
            }
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
                return res.status(400).json({ error: 'artistName is required' });
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
                id: updated.id,
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
            const { text, title, isDone, position } = req.body as {
                text?: string;
                title?: string;
                isDone?: boolean;
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
                {
                    text: text.trim(),
                    title: typeof title === 'string' ? title.trim() : '',
                    isDone: typeof isDone === 'boolean' ? isDone : false,
                },
                position as number
            );
            if (!updated) {
                return res.status(404).json({ error: 'Item not found' });
            }

            res.json({
                id: updated.id,
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
            const { fragmentId } = req.params;
            if (!fragmentId) {
                return res.status(400).json({ error: 'fragmentId is required' });
            }

            const updated = await this.orchestrator.removeFragment(
                req.params.id,
                fragmentId
            );
            if (!updated) {
                return res.status(404).json({ error: 'Item not found' });
            }

            res.json({
                id: updated.id,
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
            const { id, fragmentId } = req.params;
            const { done } = req.body as { done: boolean };

            if (!fragmentId) {
                return res.status(400).json({ error: 'fragmentId is required' });
            }
            if (typeof done !== 'boolean') {
                return res.status(400).json({ error: 'done must be a boolean' });
            }

            const updated = await this.orchestrator.toggleFragment(
                id,
                fragmentId,
                done
            );
            if (!updated) {
                return res.status(404).json({ error: 'Item not found' });
            }

            res.json({
                id: updated.id,
                ...updated.getState(),
                progress: updated.calculateProgress(),
            });
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

    markFragmentReviewed = async (
        req: Request<FragmentParams>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { id, fragmentId } = req.params;
            if (!fragmentId) {
                return res.status(400).json({ error: 'fragmentId is required' });
            }

            const updated = await this.orchestrator.markFragmentReviewed(
                id,
                fragmentId,
                Date.now()
            );
            if (!updated) {
                return res.status(404).json({ error: 'Item not found' });
            }

            res.json({
                id: updated.id,
                ...updated.getState(),
                progress: updated.calculateProgress(),
            });
        } catch (err) {
            next(err);
        }
    };

    updateFragment = async (
        req: Request<FragmentParams>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { id, fragmentId } = req.params;
            const { text, title } = req.body as {
                text?: string;
                title?: string;
            };

            if (!fragmentId) {
                return res.status(400).json({ error: 'fragmentId is required' });
            }
            if (text === undefined && title === undefined) {
                return res.status(400).json({
                    error: 'at least one of text or title is required',
                });
            }
            if (text !== undefined && typeof text !== 'string') {
                return res.status(400).json({ error: 'text must be a string' });
            }
            if (title !== undefined && typeof title !== 'string') {
                return res.status(400).json({ error: 'title must be a string' });
            }

            const patch: { text?: string; title?: string } = {};
            if (text !== undefined) patch.text = text;
            if (title !== undefined) patch.title = title;

            const updated = await this.orchestrator.updateFragment(
                id,
                fragmentId,
                patch
            );
            if (!updated) {
                return res.status(404).json({ error: 'Item not found' });
            }

            res.json({
                id: updated.id,
                ...updated.getState(),
                progress: updated.calculateProgress(),
            });
        } catch (err) {
            next(err);
        }
    };
}