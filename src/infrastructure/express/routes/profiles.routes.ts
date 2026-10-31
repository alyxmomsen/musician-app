import { Router } from 'express';
import { ProfilesController } from '../../../presentation/controllers/profiles.controller';

export function createProfilesRouter(controller: ProfilesController): Router {
    const router = Router();
    router.post('/batch', controller.batch);
    return router;
}