import 'dotenv/config';

import { MainOrchestrator } from '../application/main-orchestrator';
import { CommentsOrchestrator } from '../application/comments-orchestrator';
import { TagsOrchestrator } from '../application/tags-orchestrator';
import { ToggleFragmentUseCase } from '../application/use-cases/toggle-fragment-use-case';
import { AddCommentUseCase } from '../application/use-cases/comments/add-comment.use-case';
import { UpdateCommentUseCase } from '../application/use-cases/comments/update-comment.use-case';
import { DeleteCommentUseCase } from '../application/use-cases/comments/delete-comment.use-case';
import { GetCommentsByTargetUseCase } from '../application/use-cases/comments/get-comments-by-target.use-case';
import { GetCommentsByTrackedItemUseCase } from '../application/use-cases/comments/get-comments-by-tracked-item.use-case';
import { AddTagToTargetUseCase } from '../application/use-cases/tags/add-tag-to-target.use-case';
import { RemoveTagFromTargetUseCase } from '../application/use-cases/tags/remove-tag-from-target.use-case';
import { DeleteTagUseCase } from '../application/use-cases/tags/delete-tag.use-case';
import { GetTagsForTargetUseCase } from '../application/use-cases/tags/get-tags-for-target.use-case';
import { GetTargetsForTagUseCase } from '../application/use-cases/tags/get-targets-for-tag.use-case';
import { GetAllTagsUseCase } from '../application/use-cases/tags/get-all-tags.use-case';
import { GetTagLinksByTrackedItemUseCase } from '../application/use-cases/tags/get-tag-links-by-tracked-item.use-case';
import { GetTagByIdUseCase } from '../application/use-cases/tags/get-tag-by-id.use-case';
import { TrackedItemsListRepo } from '../infrastructure/tracked-items-list-repo';
import { JsonCommentsRepo } from '../infrastructure/comments-repo';
import { JsonTagLinksRepo } from '../infrastructure/tag-links-repo';
import { JsonTagsRepo } from '../infrastructure/tags-repo';
import { JsonUsersRepo } from '../infrastructure/users-repo';
import { JsonCredentialsRepo } from '../infrastructure/credentials-repo';
import { JsonUserProfilesRepo } from '../infrastructure/user-profiles-repo';
import { BcryptPasswordHasher } from '../infrastructure/bcrypt-password-hasher';
import { UniqueIdGenerator } from '../infrastructure/unique-id-generator';
import { TrackedItemsListController } from '../presentation/controllers/tracked-items-list.controller';
import { CommentsController } from '../presentation/controllers/comments.controller';
import { TagsController } from '../presentation/controllers/tags.controller';
import { User } from '../domain/user';

import { JwtTokenProvider } from '../infrastructure/jwt-token-provider';
import { RegisterUserUseCase } from '../application/use-cases/auth/register-user.use-case';
import { LoginUserUseCase } from '../application/use-cases/auth/login-user.use-case';
import { AuthController } from '../presentation/controllers/auth.controller';
import { createAuthMiddleware } from '../infrastructure/express/middleware/auth.middleware';
import { RequestHandler } from 'express';

import { ProfilesController } from '../presentation/controllers/profiles.controller';

import { UpdateTagDescriptionUseCase } from '../application/use-cases/tags/update-tag-description.use-case';

export interface AppConfig {
    trackedItemsPath: string;
    commentsPath: string;
    tagLinksPath: string;
    tagsPath: string;
    usersPath: string;
    credentialsPath: string;
    profilesPath: string;
}

export interface AppContainer {
    setListRepo: TrackedItemsListRepo;
    setListController: TrackedItemsListController;
    commentsController: CommentsController;
    tagsController: TagsController;
    authController: AuthController;
    authMiddleware: RequestHandler;
    profilesController: ProfilesController;
}

export async function bootstrap(config: AppConfig): Promise<AppContainer> {
    const uniqueIdGenerator = new UniqueIdGenerator();
    const passwordHasher = new BcryptPasswordHasher();

    // ---------- Репозитории ----------

    const setListRepo = new TrackedItemsListRepo(
        uniqueIdGenerator,
        config.trackedItemsPath
    );
    const commentsRepo = new JsonCommentsRepo(config.commentsPath);
    const tagLinksRepo = new JsonTagLinksRepo(config.tagLinksPath);
    const tagsRepo = new JsonTagsRepo(config.tagsPath);
    const usersRepo = new JsonUsersRepo(config.usersPath);
    const credentialsRepo = new JsonCredentialsRepo(config.credentialsPath);
    const profilesRepo = new JsonUserProfilesRepo(config.profilesPath);

    const profilesController = new ProfilesController(profilesRepo);

    // ---------- Use cases: tracked items ----------

    const toggleFragmentUseCase = new ToggleFragmentUseCase(setListRepo);
    const orchestrator = new MainOrchestrator(
        setListRepo,
        toggleFragmentUseCase,
        uniqueIdGenerator,
        commentsRepo,
        tagLinksRepo
    );
    const setListController = new TrackedItemsListController(orchestrator);

    // ---------- Use cases: comments ----------

    const commentsOrchestrator = new CommentsOrchestrator(
        new AddCommentUseCase(commentsRepo, uniqueIdGenerator),
        new UpdateCommentUseCase(commentsRepo),
        new DeleteCommentUseCase(commentsRepo, tagLinksRepo),
        new GetCommentsByTargetUseCase(commentsRepo),
        new GetCommentsByTrackedItemUseCase(commentsRepo)
    );
    const commentsController = new CommentsController(commentsOrchestrator);

    // ---------- Use cases: tags ----------

    const tagsOrchestrator = new TagsOrchestrator(
        new AddTagToTargetUseCase(tagsRepo, tagLinksRepo, uniqueIdGenerator),
        new RemoveTagFromTargetUseCase(tagLinksRepo),
        new DeleteTagUseCase(tagsRepo, tagLinksRepo),
        new GetTagsForTargetUseCase(tagsRepo, tagLinksRepo),
        new GetTargetsForTagUseCase(tagLinksRepo),
        new GetAllTagsUseCase(tagsRepo),
        new GetTagLinksByTrackedItemUseCase(tagLinksRepo),
        new GetTagByIdUseCase(tagsRepo),
        new UpdateTagDescriptionUseCase(tagsRepo)
    );
    const tagsController = new TagsController(tagsOrchestrator);

    // ---------- Init ----------

    await setListRepo.init();
    await commentsRepo.init();
    await tagLinksRepo.init();
    await tagsRepo.init();
    await usersRepo.init();
    await credentialsRepo.init();
    await profilesRepo.init();

    // ---------- Seed: tracked items ----------

    const existing = await setListRepo.getAll();
    if (existing.length === 0) {
        await orchestrator.create('Placebo', 'The Bitter End', []);
        await orchestrator.create('Placebo', 'Every Me Every You', []);
        await orchestrator.create('Placebo', 'Special Needs', []);
        await orchestrator.create('Placebo', 'This Picture', [
            { text: 'Farewell the ashtray girl', title: '', isDone: false },
            { text: 'Forbidden snowflake', title: '', isDone: false },
            { text: 'Beware this troubled world', title: '', isDone: false },
        ]);
    }




    const jwtSecret = process.env.JWT_SECRET ?? 'dev-secret-change-me';
    const tokenProvider = new JwtTokenProvider(
        jwtSecret,
        process.env.JWT_EXPIRES_IN ?? '7d'
    );

    const registerUserUseCase = new RegisterUserUseCase(
        usersRepo,
        credentialsRepo,
        profilesRepo,
        passwordHasher,
        uniqueIdGenerator
    );
    const loginUserUseCase = new LoginUserUseCase(
        usersRepo,
        credentialsRepo,
        profilesRepo,
        passwordHasher,
        tokenProvider
    );
    const authController = new AuthController(registerUserUseCase, loginUserUseCase);
    const authMiddleware = createAuthMiddleware(tokenProvider);





    // ---------- Seed: admin ----------

    const userCount = await usersRepo.count();
    if (userCount === 0) {
        const adminId = uniqueIdGenerator.generate();
        const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@example.com';
        const adminPassword = process.env.ADMIN_PASSWORD ?? 'changeme';
        const adminDisplayName = process.env.ADMIN_DISPLAYNAME ?? 'Admin';

        const passwordHash = await passwordHasher.hash(adminPassword);
        const admin = new User(adminId, 'admin', 'active', Date.now());

        await usersRepo.create(admin);
        await credentialsRepo.save(adminId, adminEmail, passwordHash);
        await profilesRepo.save(adminId, adminDisplayName);

        console.log(`[seed] admin created: ${adminEmail} / displayName: ${adminDisplayName}`);
    }

    return {
        setListRepo,
        setListController,
        commentsController,
        tagsController,
        authController,
        authMiddleware,
        profilesController,
    };
}