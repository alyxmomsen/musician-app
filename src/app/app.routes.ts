import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/tracked-item-list/tracked-item-list.component').then(
        (m) => m.TrackedItemListComponent
      ),
  },
  {
    path: 'items/new',
    loadComponent: () =>
      import('./presentation/tracked-item-form/tracked-item-form.component').then(
        (m) => m.TrackedItemFormComponent
      ),
  },
  {
    path: 'items/:id',
    loadComponent: () =>
      import('./presentation/tracked-item-detail/tracked-item-detail.component').then(
        (m) => m.TrackedItemDetailComponent
      ),
  },
  {
    path: 'items/:id/edit',
    loadComponent: () =>
      import('./presentation/tracked-item-form/tracked-item-form.component').then(
        (m) => m.TrackedItemFormComponent
      ),
  },
];