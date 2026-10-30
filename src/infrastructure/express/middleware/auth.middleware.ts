import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ITokenProvider } from '../../../domain/ports/token-provider';

export interface IAuthRequest extends Request {
    userId?: string;
    userRole?: string;
}

export function createAuthMiddleware(
    tokenProvider: ITokenProvider
): RequestHandler {
    return async (req: IAuthRequest, res: Response, next: NextFunction) => {
        const header = req.headers.authorization;
        if (!header || !header.startsWith('Bearer ')) {
            res.status(401).json({
                error: 'Missing or invalid Authorization header',
            });
            return;
        }
        const token = header.slice(7);
        const payload = await tokenProvider.verify(token);
        if (!payload) {
            res.status(401).json({ error: 'Invalid or expired token' });
            return;
        }
        req.userId = payload.userId;
        req.userRole = payload.role;
        next();
    };
}