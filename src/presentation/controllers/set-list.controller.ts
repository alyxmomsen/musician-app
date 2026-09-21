import { Request, Response, NextFunction } from 'express';
import { MainOrchestrator } from '../../application/main-orchestrator';

interface FragmentParams {
    id: string;
    fragmentIndex: string;
}

export class TrackedItemsListController {
    constructor(private readonly orchestrator: MainOrchestrator) {}

    getAll = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const items = await this.orchestrator.getAll();
            res.json(items.map((item) => ({
                ...item.getState(),
                progress: item.calculateProgress(),
            })));
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
                return res.status(400).json({ error: 'done must be a boolean' });
            }

            const updated = await this.orchestrator.toggleFragment(id, index, done);
            if (!updated) return res.status(404).json({ error: 'Item not found' });

            res.json({
                ...updated.getState(),
                progress: updated.calculateProgress(),
            });
            
        } catch (err) {
            next(err);
        }
    };
}