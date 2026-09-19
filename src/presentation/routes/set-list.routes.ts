import { Router } from 'express';
import { SetListController } from '../controllers/set-list.controller';

export function createSetListRouter(controller: SetListController): Router {
    const router = Router();

    router.get('/', controller.getAll);
    router.get('/random', controller.getRandom); // ← обязательно ДО /:id
    router.get('/:id', controller.getById);
    router.post('/', controller.addMany);
    router.put('/:id', controller.updateOne);
    router.delete('/:id', controller.removeOne);

    return router;
}
