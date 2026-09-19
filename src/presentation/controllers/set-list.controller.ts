import { Request, Response, NextFunction } from 'express';
import { MainOrchestrator } from '../../application/main-orchestrator';

interface IdParams {
    id: string;
}

interface FragmentParams {
    id: string;
    fragmentIndex: string; // Express всегда отдаёт params строками
}

export class SetListController {
    constructor(private readonly orchestrator: MainOrchestrator) {}

    getAll = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const items = await this.orchestrator.getAll();

            res.json(items.map((item) => item.getDTO()));
        } catch (err) {
            next(err);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction) => {
        // try {
        //     const id = req.params.id;
        //     if (Array.isArray(id)) return;
        //     const item = await this.setListRepo.getById(id);
        //     if (item === null) {
        //         res.status(404).json({ error: 'Item not found' });
        //         return;
        //     }
        //     res.json(item.getDTO());
        // } catch (err) {
        //     next(err);
        // }
    };

    getRandom = async (_req: Request, res: Response, next: NextFunction) => {
        // try {
        //     const item = await this.setListRepo.getRandom();
        //     if (item === null) {
        //         res.status(404).json({ error: 'Set list is empty' });
        //         return;
        //     }
        //     res.json(item.getDTO());
        // } catch (err) {
        //     next(err);
        // }
    };

    addMany = async (req: Request, res: Response, next: NextFunction) => {
        // try {
        //     const items = req.body as TListItem[];
        //     await this.setListRepo.addMany(items);
        //     res.status(201).json({ ok: true });
        // } catch (err) {
        //     next(err);
        // }
    };

    updateOne = async (req: Request, res: Response, next: NextFunction) => {

        console.log('update one');

        // await this.setListRepo.updateOne({ ...req.body, id: req.params.id });
        // const updated = await this.setListRepo.getById(req.params.id);
        // if (!updated) return res.status(404).json({ error: 'not found' });
        // res.json(updated.getDTO());
    };

    removeOne = async (req: Request, res: Response, next: NextFunction) => {
        // try {
        //     const id = req.params.id;
        //     if (Array.isArray(id)) return;
        //     await this.setListRepo.removeOne(id);
        //     res.status(204).send();
        // } catch (err) {
        //     next(err);
        // }
    };

    // updateProgress = async (
    //     req: Request<IdParams>,
    //     res: Response,
    //     next: NextFunction
    // ) => {

    //     console.log('progress');

    //     try {
    //         const { id } = req.params; // ← теперь string
    //         const { delta } = req.body as { delta: number };

    //         if (typeof delta !== 'number') {
    //             return res
    //                 .status(400)
    //                 .json({ error: 'delta must be a number' });
    //         }

    //         const updated =
    //             delta > 0
    //                 ? await this.orchestrator.incrementItemProgress(id, delta)
    //                 : await this.orchestrator.decrementItemProgress(id, -delta);

    //         if (!updated) {
    //             return res.status(404).json({ error: 'Item not found' });
    //         }

    //         res.json(updated.getDTO());
    //     } catch (err) {
    //         next(err);
    //     }
    // };

    toggleFragment = async (
        req: Request<FragmentParams>,
        res: Response,
        next: NextFunction
    ) => {

        console.log('try ...');

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

            console.log('try to toggle');

            const updated = await this.orchestrator.toggleFragment(
                id,
                index,
                done
            );

            if (!updated)
                return res.status(404).json({ error: 'Item not found' });

            res.json(updated.getDTO());
            
        } catch (err) {
            next(err);
        }
    };
}
