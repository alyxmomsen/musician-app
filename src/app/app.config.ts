import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { ConfirmationService } from 'primeng/api';

import { routes } from './app.routes';
import { TRACKED_ITEM_REPOSITORY_TOKEN } from './core/tokens/tracked-item-repository.token';
import { HttpTrackedItemRepository } from './infrastructure/tracked-item/http-tracked-item.repository';

import { MessageService } from 'primeng/api';

import { COMMENTS_REPOSITORY_TOKEN } from './core/tokens/comments-repository.token';
import { TAGS_REPOSITORY_TOKEN } from './core/tokens/tags-repository.token';
import { HttpCommentsRepository } from './infrastructure/comment/http-comments.repository';
import { HttpTagsRepository } from './infrastructure/tag/http-tags.repository';


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    providePrimeNG({ theme: { preset: Aura } }),
    MessageService,
    ConfirmationService,
    {
      provide: TRACKED_ITEM_REPOSITORY_TOKEN,
      useClass: HttpTrackedItemRepository,
    },
    {
      provide: COMMENTS_REPOSITORY_TOKEN,
      useClass: HttpCommentsRepository,
    },
    {
      provide: TAGS_REPOSITORY_TOKEN,
      useClass: HttpTagsRepository,
    },
  ],
};
