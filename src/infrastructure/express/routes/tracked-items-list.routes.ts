import { Router } from 'express';
import { TrackedItemsListController } from '../../../presentation/controllers/tracked-items-list.controller';

export function createTrackedItemsListRouter(
    controller: TrackedItemsListController
): Router {
    const router = Router();

    router.get('/', controller.getPage);
    router.post('/', controller.create);
    router.get('/:id', controller.getById);
    router.put('/:id', controller.update);
    router.post('/:id/fragments', controller.addFragment);
    router.delete('/:id/fragments/:fragmentIndex', controller.removeFragment);
    router.patch('/:id/fragments/:fragmentIndex', controller.toggleFragment);
    router.delete('/:id', controller.remove);
    router.patch('/:id/fragments/:fragmentIndex/review', controller.markFragmentReviewed);
    router.patch('/:id/fragments/:fragmentIndex/title', controller.renameFragmentTitle);

    return router;
}