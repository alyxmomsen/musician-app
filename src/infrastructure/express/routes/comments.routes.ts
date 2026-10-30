import { Router } from 'express';
import { CommentsController } from '../../../presentation/controllers/comments.controller';

export function createCommentsRouter(controller: CommentsController): Router {
    const router = Router();

    router.get('/', controller.getByTrackedItem);
    router.post('/by-target', controller.getByTarget);
    router.post('/', controller.create);
    router.patch('/:id', controller.update);
    router.delete('/:id', controller.remove);

    return router;
}
