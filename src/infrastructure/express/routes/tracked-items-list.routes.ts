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
    router.delete('/:id', controller.remove);

    router.post('/:id/fragments', controller.addFragment);
    router.delete('/:id/fragments/:fragmentIndex', controller.removeFragment);

    // PATCH-роуты: сначала более специфичные, потом общий
    router.patch('/:id/fragments/:fragmentIndex/done', controller.toggleFragment);
    router.patch('/:id/fragments/:fragmentIndex/review', controller.markFragmentReviewed);
    router.patch('/:id/fragments/:fragmentIndex', controller.updateFragment);

    return router;
}