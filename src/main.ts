import { AppConfig, AppContainer, bootstrap } from './bootstrap/container';
import { createApp } from './infrastructure/express/app';
import { Loop } from './infrastructure/loop';

const appConfig: AppConfig = {
    dataPath: './src/tracked-items.json',
};

const bootstrapFactory = function (
    appConfig: AppConfig
): () => Promise<AppContainer> {
    return () => bootstrap(appConfig);
};

(async (deps: { bootstrap: () => Promise<AppContainer> }) => {
    const appContainer = await deps.bootstrap();

    const { setListController: itemsListController, setListRepo } =
        appContainer;

    const app = createApp(itemsListController);

    app.listen(3000, '0.0.0.0', () => {
        console.log(`express running on port 3000`);
    });

    const mainloop = new Loop(1000, async () => {
        
    });

    mainloop.start();
})({ bootstrap: bootstrapFactory(appConfig) });
