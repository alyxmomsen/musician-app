import jwt from 'jsonwebtoken';
import { ITokenPayload, ITokenProvider } from '../domain/ports/token-provider';

export class JwtTokenProvider implements ITokenProvider {
    constructor(
        private readonly secret: string,
        private readonly expiresIn: string = '7d'
    ) {}

    async generate(userId: string, role: string): Promise<string> {
        return jwt.sign({ sub: userId, role }, this.secret, {
            expiresIn: this.expiresIn,
        } as jwt.SignOptions);
    }

    async verify(token: string): Promise<ITokenPayload | null> {
        try {
            const payload = jwt.verify(token, this.secret) as {
                sub: string;
                role: string;
            };
            return { userId: payload.sub, role: payload.role };
        } catch {
            return null;
        }
    }
}