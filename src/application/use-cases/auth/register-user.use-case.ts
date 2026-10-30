import { User } from '../../../domain/user';
import { IUsersRepo } from '../../../domain/ports/users-repo';
import { ICredentialsRepo } from '../../../domain/ports/credentials-repo';
import { IUserProfilesRepo } from '../../../domain/ports/user-profiles-repo';
import { IPasswordHasher } from '../../../domain/ports/password-hasher';
import { IUniqueIdGenerator } from '../../../domain/ports/uniqueIdGenerator';

export class RegisterUserUseCase {
    constructor(
        private usersRepo: IUsersRepo,
        private credentialsRepo: ICredentialsRepo,
        private profilesRepo: IUserProfilesRepo,
        private passwordHasher: IPasswordHasher,
        private idGenerator: IUniqueIdGenerator
    ) {}

    async execute(
        email: string,
        password: string,
        displayName: string
    ): Promise<User> {
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedName = displayName.trim();

        if (!trimmedEmail.includes('@')) {
            throw new Error('Invalid email');
        }
        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters');
        }
        if (!trimmedName) {
            throw new Error('Display name is required');
        }

        const existingByEmail = await this.credentialsRepo.findByEmail(trimmedEmail);
        if (existingByEmail) {
            throw new Error('Email already taken');
        }

        const existingByName = await this.profilesRepo.getByDisplayName(trimmedName);
        if (existingByName) {
            throw new Error('Display name already taken');
        }

        const userId = this.idGenerator.generate();
        const passwordHash = await this.passwordHasher.hash(password);
        const user = new User(userId, 'user', 'active', Date.now());

        await this.usersRepo.create(user);
        await this.credentialsRepo.save(userId, trimmedEmail, passwordHash);
        await this.profilesRepo.save(userId, trimmedName);

        return user;
    }
}