export type TUniqueId = string;

export type TUserRole = 'admin' | 'user';
export type TUserStatus = 'active' | 'blocked';

export type TUserState = {
    id: TUniqueId;
    role: TUserRole;
    status: TUserStatus;
    createdAt: number;
};

export class User {
    constructor(
        readonly id: TUniqueId,
        private role: TUserRole,
        private status: TUserStatus,
        readonly createdAt: number
    ) {}

    getRole(): TUserRole { return this.role; }
    getStatus(): TUserStatus { return this.status; }
    isAdmin(): boolean { return this.role === 'admin'; }
    isActive(): boolean { return this.status === 'active'; }

    setRole(role: TUserRole): void { this.role = role; }
    setStatus(status: TUserStatus): void { this.status = status; }

    getState(): TUserState {
        return {
            id: this.id,
            role: this.role,
            status: this.status,
            createdAt: this.createdAt,
        };
    }

    static fromState(s: TUserState): User {
        return new User(s.id, s.role, s.status, s.createdAt);
    }
}