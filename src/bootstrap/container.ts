import { MainOrchestrator } from '../application/main-orchestrator';
import { CommentsOrchestrator } from '../application/comments-orchestrator';
import { ToggleFragmentUseCase } from '../application/use-cases/toggle-fragment-use-case';
import { AddCommentUseCase } from '../application/use-cases/comments/add-comment.use-case';
import { UpdateCommentUseCase } from '../application/use-cases/comments/update-comment.use-case';
import { DeleteCommentUseCase } from '../application/use-cases/comments/delete-comment.use-case';
import { GetCommentsByTargetUseCase } from '../application/use-cases/comments/get-comments-by-target.use-case';
import { GetCommentsByTrackedItemUseCase } from '../application/use-cases/comments/get-comments-by-tracked-item.use-case';
import { TrackedItemsListRepo } from '../infrastructure/tracked-items-list-repo';
import { JsonCommentsRepo } from '../infrastructure/comments-repo';
import { JsonTagLinksRepo } from '../infrastructure/tag-links-repo';
import { UniqueIdGenerator } from '../infrastructure/unique-id-generator';
import { TrackedItemsListController } from '../presentation/controllers/tracked-items-list.controller';
import { CommentsController } from '../presentation/controllers/comments.controller';

export interface AppConfig {
    trackedItemsPath: string;
    commentsPath: string;
    tagLinksPath: string;
}

export interface AppContainer {
    setListRepo: TrackedItemsListRepo;
    setListController: TrackedItemsListController;
    commentsController: CommentsController;
}

export async function bootstrap(config: AppConfig): Promise<AppContainer> {
    const uniqueIdGenerator = new UniqueIdGenerator();

    const setListRepo = new TrackedItemsListRepo(
        uniqueIdGenerator,
        config.trackedItemsPath
    );
    const commentsRepo = new JsonCommentsRepo(config.commentsPath);
    const tagLinksRepo = new JsonTagLinksRepo(config.tagLinksPath);

    const toggleFragmentUseCase = new ToggleFragmentUseCase(setListRepo);
    const orchestrator = new MainOrchestrator(setListRepo, toggleFragmentUseCase);
    const setListController = new TrackedItemsListController(orchestrator);

    const commentsOrchestrator = new CommentsOrchestrator(
        new AddCommentUseCase(commentsRepo, uniqueIdGenerator),
        new UpdateCommentUseCase(commentsRepo),
        new DeleteCommentUseCase(commentsRepo, tagLinksRepo),
        new GetCommentsByTargetUseCase(commentsRepo),
        new GetCommentsByTrackedItemUseCase(commentsRepo)
    );
    const commentsController = new CommentsController(commentsOrchestrator);

    await setListRepo.init();
    await commentsRepo.init();
    await tagLinksRepo.init();

    const existing = await setListRepo.getAll();
    if (existing.length === 0) {
        await setListRepo.addMany([
            { artistName: 'Placebo', title: 'The Bitter End', fragments: [] },
            { artistName: 'Placebo', title: 'Every Me Every You', fragments: [] },
            { artistName: 'Placebo', title: 'Special Needs', fragments: [] },
            {
                artistName: 'Placebo',
                title: 'This Picture',
                fragments: [
                    { text: 'Farewell the ashtray girl', title: '', isDone: false, lastReviewedAt: null },
                    { text: 'Forbidden snowflake', title: '', isDone: false, lastReviewedAt: null },
                    { text: 'Beware this troubled world', title: '', isDone: false, lastReviewedAt: null },
                ],
            },
        ]);
    }

    return { setListRepo, setListController, commentsController };
}