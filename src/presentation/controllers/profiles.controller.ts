import { Request, Response, NextFunction } from 'express';
import { IUserProfilesRepo } from '../../domain/ports/user-profiles-repo';

export class ProfilesController {
    constructor(private readonly profilesRepo: IUserProfilesRepo) {}

    batch = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userIds } = req.body as { userIds?: string[] };
            if (!Array.isArray(userIds)) {
                return res
                    .status(400)
                    .json({ error: 'userIds must be an array' });
            }
            const map = await this.profilesRepo.getByUserIds(userIds);
            const result = Array.from(map.values()).map((p) => ({
                userId: p.userId,
                displayName: p.displayName,
            }));
            res.json(result);
        } catch (err) {
            next(err);
        }
    };
}