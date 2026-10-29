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

import { TagsOrchestrator } from '../application/tags-orchestrator';
import { AddTagToTargetUseCase } from '../application/use-cases/tags/add-tag-to-target.use-case';
import { RemoveTagFromTargetUseCase } from '../application/use-cases/tags/remove-tag-from-target.use-case';
import { DeleteTagUseCase } from '../application/use-cases/tags/delete-tag.use-case';
import { GetTagsForTargetUseCase } from '../application/use-cases/tags/get-tags-for-target.use-case';
import { GetTargetsForTagUseCase } from '../application/use-cases/tags/get-targets-for-tag.use-case';
import { GetAllTagsUseCase } from '../application/use-cases/tags/get-all-tags.use-case';
import { JsonTagsRepo } from '../infrastructure/tags-repo';
import { TagsController } from '../presentation/controllers/tags.controller';

export interface AppConfig {
    trackedItemsPath: string;
    commentsPath: string;
    tagLinksPath: string;
    tagsPath: string;
}

export interface AppContainer {
    setListRepo: TrackedItemsListRepo;
    setListController: TrackedItemsListController;
    commentsController: CommentsController;
    tagsController: TagsController;
}

export async function bootstrap(config: AppConfig): Promise<AppContainer> {
    const uniqueIdGenerator = new UniqueIdGenerator();

    const setListRepo = new TrackedItemsListRepo(
        uniqueIdGenerator,
        config.trackedItemsPath
    );
    const commentsRepo = new JsonCommentsRepo(config.commentsPath);
    const tagLinksRepo = new JsonTagLinksRepo(config.tagLinksPath);
    const tagsRepo = new JsonTagsRepo(config.tagsPath);

    const toggleFragmentUseCase = new ToggleFragmentUseCase(setListRepo);
    const orchestrator = new MainOrchestrator(
        setListRepo,
        toggleFragmentUseCase,
        uniqueIdGenerator,
        commentsRepo,
        tagLinksRepo
    );
    const setListController = new TrackedItemsListController(orchestrator);

    const commentsOrchestrator = new CommentsOrchestrator(
        new AddCommentUseCase(commentsRepo, uniqueIdGenerator),
        new UpdateCommentUseCase(commentsRepo),
        new DeleteCommentUseCase(commentsRepo, tagLinksRepo),
        new GetCommentsByTargetUseCase(commentsRepo),
        new GetCommentsByTrackedItemUseCase(commentsRepo)
    );

    const tagsOrchestrator = new TagsOrchestrator(
        new AddTagToTargetUseCase(tagsRepo, tagLinksRepo, uniqueIdGenerator),
        new RemoveTagFromTargetUseCase(tagLinksRepo),
        new DeleteTagUseCase(tagsRepo, tagLinksRepo),
        new GetTagsForTargetUseCase(tagsRepo, tagLinksRepo),
        new GetTargetsForTagUseCase(tagLinksRepo),
        new GetAllTagsUseCase(tagsRepo)
    );
    const tagsController = new TagsController(tagsOrchestrator);

    await tagsRepo.init();

    const commentsController = new CommentsController(commentsOrchestrator);

    await setListRepo.init();
    await commentsRepo.init();
    await tagLinksRepo.init();

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

    return { setListRepo, setListController, commentsController, tagsController  };
}