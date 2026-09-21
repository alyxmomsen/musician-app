import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { createTrackedItemsListRouter } from './routes/tracked-list.controller';
import { TrackedItemsListController } from '../../presentation/controllers/set-list.controller';

export function createApp(listItemController: TrackedItemsListController) {
    const app = express();

    app.use(cors());
    app.use(express.json());

    app.use('/api/set-list', createTrackedItemsListRouter(listItemController));
    app.get('/api/health', (_req, res) => res.json({ ok: true }));

    app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
        console.error('[error]', err);
        res.status(500).json({ error: 'Internal Server Error' });
    });

    return app;
}
