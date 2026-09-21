import { Router } from 'express';
import { TrackedItemsListController } from '../../../presentation/controllers/set-list.controller';

export function createTrackedItemsListRouter(controller: TrackedItemsListController): Router {
    const router = Router();

    router.get('/', controller.getAll);
    router.patch('/:id/fragments/:fragmentIndex', controller.toggleFragment);

    return router;
}