import { MainOrchestrator } from '../application/main-orchestrator';
import { ToggleFragmentUseCase } from '../application/use-cases/toggle-fragment-use-case';
import { TrackedItemsListRepo } from '../infrastructure/tracked-items-list-repo';
import { UniqueIdGenerator } from '../infrastructure/unique-id-generator';
import { TrackedItemsListController } from '../presentation/controllers/tracked-items-list.controller';

export interface AppConfig {
    dataPath: string;
}

export interface AppContainer {
    setListRepo: TrackedItemsListRepo;
    setListController: TrackedItemsListController;
}

export async function bootstrap(config: AppConfig): Promise<AppContainer> {
    const uniqueIdGenerator = new UniqueIdGenerator();
    const setListRepo = new TrackedItemsListRepo(uniqueIdGenerator, config.dataPath);
    
    const toggleFragmentUseCase = new ToggleFragmentUseCase(
        setListRepo
    );
    
    const orchestrator = new MainOrchestrator(setListRepo, toggleFragmentUseCase);

    const setListController = new TrackedItemsListController(orchestrator);
    
    await setListRepo.init();

    const existing = await setListRepo.getAll();
    if (existing.length === 0) {
        await setListRepo.addMany([
    {
        artistName: 'Placebo',
        title: 'The Bitter End',
        fragments: [],
    },
    {
        artistName: 'Placebo',
        title: 'Every Me Every You',
        fragments: [],
    },
    {
        artistName: 'Placebo',
        title: 'Special Needs',
        fragments: [],
    },
    {
        artistName: 'Placebo',
        title: 'This Picture',
        fragments: [
            {
                text: 'Farewell the ashtray girl',
                title: '',
                isDone: false,
                lastReviewedAt: null,
            },
            {
                text: 'Forbidden snowflake',
                title: '',
                isDone: false,
                lastReviewedAt: null,
            },
            {
                text: 'Beware this troubled world',
                title: '',
                isDone: false,
                lastReviewedAt: null,
            },
        ],
    },
]);
    }

    return { setListRepo, setListController };
}
