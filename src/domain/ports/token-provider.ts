export interface ITokenPayload {
    userId: string;
    role: string;
}

export interface ITokenProvider {
    generate(userId: string, role: string): Promise<string>;
    verify(token: string): Promise<ITokenPayload | null>;
}