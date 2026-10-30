import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./presentation/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./presentation/tracked-item-list/tracked-item-list.component').then(
        (m) => m.TrackedItemListComponent
      ),
  },
  {
    path: 'items/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./presentation/tracked-item-form/tracked-item-form.component').then(
        (m) => m.TrackedItemFormComponent
      ),
  },
  {
    path: 'items/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./presentation/tracked-item-detail/tracked-item-detail.component').then(
        (m) => m.TrackedItemDetailComponent
      ),
  },
  {
    path: 'items/:id/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./presentation/tracked-item-form/tracked-item-form.component').then(
        (m) => m.TrackedItemFormComponent
      ),
  },
];