import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { createTrackedItemsListRouter } from './routes/tracked-items-list.routes';
import { TrackedItemsListController } from '../../presentation/controllers/tracked-items-list.controller';

import { CommentsController } from '../../presentation/controllers/comments.controller';
import { createCommentsRouter } from './routes/comments.routes';

import { TagsController } from '../../presentation/controllers/tags.controller';
import { createTagsRouter } from './routes/tags.routes';

export function createApp(
    listItemController: TrackedItemsListController,
    commentsController: CommentsController,
    tagsController: TagsController
) {
    const app = express();

    app.use(cors());
    app.use(express.json());

    app.use('/api/tracked-items', createTrackedItemsListRouter(listItemController));
    app.use('/api/comments', createCommentsRouter(commentsController));

    app.use('/api/comments', createCommentsRouter(commentsController));
    app.use('/api/tags', createTagsRouter(tagsController));

    app.get('/api/health', (_req, res) => res.json({ ok: true }));

    app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
        console.error('[error]', err);
        res.status(500).json({ error: 'Internal Server Error' });
    });

    return app;
}
