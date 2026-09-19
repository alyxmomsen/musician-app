import { Router } from 'express';
import { SetListController } from '../../../presentation/controllers/set-list.controller';

export function createSetListRouter(controller: SetListController): Router {
    const router = Router();

    router.get('/', controller.getAll);
    router.get('/random', controller.getRandom);
    router.get('/:id', controller.getById);
    router.post('/', controller.addMany);
    router.put('/:id', controller.updateOne);
    router.delete('/:id', controller.removeOne);
    // router.patch('/:id/progress', controller.updateProgress);
    router.patch('/:id/fragments/:fragmentIndex', controller.toggleFragment);

    return router;
}
