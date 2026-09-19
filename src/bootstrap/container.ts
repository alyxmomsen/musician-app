import { MainOrchestrator } from '../application/main-orchestrator';
import { ToggleFragmentUseCase } from '../application/use-cases/toggle-fragment-use-case';
import { SetListRepo } from '../infrastructure/set-list-repo';
import { UniqueIdGenerator } from '../infrastructure/unique-id-generator';
import { SetListController } from '../presentation/controllers/set-list.controller';

export interface AppConfig {
    dataPath: string;
}

export interface AppContainer {
    setListRepo: SetListRepo;
    setListController: SetListController;
}

export async function bootstrap(config: AppConfig): Promise<AppContainer> {
    const uniqueIdGenerator = new UniqueIdGenerator();
    const setListRepo = new SetListRepo(uniqueIdGenerator, config.dataPath);
    
    const toggleFragmentUseCase = new ToggleFragmentUseCase(
        setListRepo
    );
    
    const orchestrator = new MainOrchestrator(setListRepo, toggleFragmentUseCase);

    const setListController = new SetListController(orchestrator);
    
    await setListRepo.init();

    const existing = await setListRepo.getAll();
    if (existing.length === 0) {
        await setListRepo.addMany([
            {
                originalArtistName: 'Placebo',
                title: 'The Bitter End',
                progressPercentage: 0,
                fragments: [],
            },
            {
                originalArtistName: 'Placebo',
                title: 'Every Me Every You',
                progressPercentage: 0,
                fragments: [],
            },
            {
                originalArtistName: 'Placebo',
                title: 'Special Needs',
                progressPercentage: 0,
                fragments: [],
            },
            {
                originalArtistName: 'Placebo',
                title: 'This Picture',
                progressPercentage: 0,
                fragments: [
                    {
                        text:'Для твоего кейса (трекер прогресса) я бы советовал вариант 2: пусть Use Case сам проверяет существование и управляет контекстом ошибки. Тогда порт можно оставить максимально простым, а логику «не удалось обновить, потому что нет такой песни» держать в Use Case — там она ближе к пользовательскому сценарию.',
                        isDone:false,
                    },
                    {
                        text:'bar',
                        isDone:false,
                    },
                    {
                        text:'baz',
                        isDone:false,
                    },
                ] ,
            },
        ]);
    }

    return { setListRepo, setListController };
}
