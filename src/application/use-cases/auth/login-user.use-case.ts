import { IUsersRepo } from '../../../domain/ports/users-repo';
import { ICredentialsRepo } from '../../../domain/ports/credentials-repo';
import { IUserProfilesRepo } from '../../../domain/ports/user-profiles-repo';
import { IPasswordHasher } from '../../../domain/ports/password-hasher';
import { ITokenProvider } from '../../../domain/ports/token-provider';

export interface ILoginResult {
    token: string;
    user: {
        id: string;
        role: string;
        displayName: string;
    };
}

export class LoginUserUseCase {
    constructor(
        private usersRepo: IUsersRepo,
        private credentialsRepo: ICredentialsRepo,
        private profilesRepo: IUserProfilesRepo,
        private passwordHasher: IPasswordHasher,
        private tokenProvider: ITokenProvider
    ) {}

    async execute(email: string, password: string): Promise<ILoginResult> {
        const trimmedEmail = email.trim().toLowerCase();

        const credentials = await this.credentialsRepo.findByEmail(trimmedEmail);
        if (!credentials) {
            throw new Error('Invalid credentials');
        }

        const isValid = await this.passwordHasher.compare(
            password,
            credentials.passwordHash
        );
        if (!isValid) {
            throw new Error('Invalid credentials');
        }

        const user = await this.usersRepo.getById(credentials.userId);
        if (!user) {
            throw new Error('User not found');
        }
        if (!user.isActive()) {
            throw new Error('User is blocked');
        }

        const profile = await this.profilesRepo.getByUserId(user.id);
        if (!profile) {
            throw new Error('Profile not found');
        }

        const token = await this.tokenProvider.generate(user.id, user.getRole());

        return {
            token,
            user: {
                id: user.id,
                role: user.getRole(),
                displayName: profile.displayName,
            },
        };
    }
}