import { Router } from 'express';
import { TagsController } from '../../../presentation/controllers/tags.controller';

export function createTagsRouter(controller: TagsController): Router {
    
    const router = Router();

    router.get('/', controller.getAll);
    router.post('/for-target', controller.getForTarget);
    router.post('/link', controller.add);
    router.delete('/link', controller.remove);
    router.post('/link/remove', controller.remove);
    router.get('/:id/targets', controller.getTargetsForTag);
    router.delete('/:id', controller.removeTag);

    return router;
}