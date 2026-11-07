import 'dotenv/config';

import { AppConfig, AppContainer, bootstrap } from './bootstrap/container';
import { createApp } from './infrastructure/express/app';
import { Loop } from './infrastructure/loop';

const appConfig: AppConfig = {
    trackedItemsPath: './data/tracked-items.json',
    commentsPath: './data/comments.json',
    tagLinksPath: './data/tag-links.json',
    tagsPath: './data/tags.json',
    usersPath: './data/users.json',
    credentialsPath: './data/credentials.json',
    profilesPath: './data/profiles.json',
};

const bootstrapFactory = function (
    appConfig: AppConfig
): () => Promise<AppContainer> {
    return () => bootstrap(appConfig);
};

(async (deps: { bootstrap: () => Promise<AppContainer> }) => {
    const appContainer = await deps.bootstrap();

    const {
        setListController,
        commentsController,
        tagsController,
        authController,
        profilesController,
        authMiddleware,
    } = appContainer;

    const app = createApp(
        setListController,
        commentsController,
        tagsController,
        authController,
        profilesController,
        authMiddleware
    );

    app.listen(3000, '0.0.0.0', () => {
        console.log(`express running on port 3000`);
    });

    const mainloop = new Loop(1000, async () => {});

    mainloop.start();
})({ bootstrap: bootstrapFactory(appConfig) });