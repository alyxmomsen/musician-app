import { Request, Response, NextFunction } from 'express';
import { RegisterUserUseCase } from '../../application/use-cases/auth/register-user.use-case';
import { LoginUserUseCase } from '../../application/use-cases/auth/login-user.use-case';

export class AuthController {
    constructor(
        private registerUseCase: RegisterUserUseCase,
        private loginUseCase: LoginUserUseCase
    ) {}

    register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password, displayName } = req.body as {
                email?: string;
                password?: string;
                displayName?: string;
            };
            if (
                typeof email !== 'string' ||
                typeof password !== 'string' ||
                typeof displayName !== 'string'
            ) {
                return res.status(400).json({
                    error: 'email, password and displayName are required',
                });
            }
            const user = await this.registerUseCase.execute(
                email,
                password,
                displayName
            );
            res.status(201).json({ id: user.id, role: user.getRole() });
        } catch (err) {
            if (err instanceof Error) {
                return res.status(400).json({ error: err.message });
            }
            next(err);
        }
    };

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body as {
                email?: string;
                password?: string;
            };
            if (typeof email !== 'string' || typeof password !== 'string') {
                return res.status(400).json({
                    error: 'email and password are required',
                });
            }
            const result = await this.loginUseCase.execute(email, password);
            res.json(result);
        } catch (err) {
            if (err instanceof Error) {
                return res.status(401).json({ error: err.message });
            }
            next(err);
        }
    };
}