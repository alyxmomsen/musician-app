import express, {
    NextFunction,
    Request,
    RequestHandler,
    Response,
} from 'express';
import cors from 'cors';
import { TrackedItemsListController } from '../../presentation/controllers/tracked-items-list.controller';
import { CommentsController } from '../../presentation/controllers/comments.controller';
import { TagsController } from '../../presentation/controllers/tags.controller';
import { AuthController } from '../../presentation/controllers/auth.controller';
import { createTrackedItemsListRouter } from './routes/tracked-items-list.routes';
import { createCommentsRouter } from './routes/comments.routes';
import { createTagsRouter } from './routes/tags.routes';
import { createAuthRouter } from './routes/auth.routes';

import { ProfilesController } from '../../presentation/controllers/profiles.controller';
import { createProfilesRouter } from './routes/profiles.routes';

export function createApp(
    listItemController: TrackedItemsListController,
    commentsController: CommentsController,
    tagsController: TagsController,
    authController: AuthController,
    profilesController: ProfilesController,
    authMiddleware: RequestHandler
) {
    const app = express();

    app.use(cors());
    app.use(express.json());

    app.get('/api/health', (_req, res) => res.json({ ok: true }));

    // Открытые роуты
    app.use('/api/auth', createAuthRouter(authController));

    // Защищённые роуты
    app.use(
        '/api/tracked-items',
        authMiddleware,
        createTrackedItemsListRouter(listItemController)
    );
    app.use(
        '/api/comments',
        authMiddleware,
        createCommentsRouter(commentsController)
    );
    app.use('/api/tags', authMiddleware, createTagsRouter(tagsController));

    app.use(
        '/api/profiles',
        authMiddleware,
        createProfilesRouter(profilesController)
    );

    app.use(
        (err: Error, _req: Request, res: Response, _next: NextFunction) => {
            console.error('[error]', err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    );

    return app;
}