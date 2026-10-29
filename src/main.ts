import { AppConfig, AppContainer, bootstrap } from './bootstrap/container';
import { createApp } from './infrastructure/express/app';
import { Loop } from './infrastructure/loop';

const appConfig: AppConfig = {
    trackedItemsPath: './src/tracked-items.json',
    commentsPath: './src/comments.json',
    tagLinksPath: './src/tag-links.json',
    tagsPath: './src/tags.json',
};

const bootstrapFactory = function (
    appConfig: AppConfig
): () => Promise<AppContainer> {
    return () => bootstrap(appConfig);
};

(async (deps: { bootstrap: () => Promise<AppContainer> }) => {
    const appContainer = await deps.bootstrap();

    const { setListController, commentsController, tagsController } = appContainer;

    const app = createApp(setListController, commentsController, tagsController);

    app.listen(3000, '0.0.0.0', () => {
        console.log(`express running on port 3000`);
    });

    const mainloop = new Loop(1000, async () => {});

    mainloop.start();
})({ bootstrap: bootstrapFactory(appConfig) });