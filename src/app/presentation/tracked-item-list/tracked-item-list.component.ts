import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProgressBarModule } from 'primeng/progressbar';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { GetTrackedItemsPageUseCase } from '../../application/tracked-item/use-cases/get-tracked-items-page.use-case';
import { DeleteTrackedItemUseCase } from '../../application/tracked-item/use-cases/delete-tracked-item.use-case';
import { TrackedItem } from '../../domain/tracked-item/models/tracked-item.entity';

@Component({
  selector: 'app-tracked-item-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ProgressBarModule,
    ButtonModule,
    MenuModule,
  ],
  templateUrl: './tracked-item-list.component.html',
  styleUrls: ['./tracked-item-list.component.scss'],
  providers: [GetTrackedItemsPageUseCase, DeleteTrackedItemUseCase],
})
export class TrackedItemListComponent implements OnInit {
  items = signal<TrackedItem[]>([]);
  total = signal(0);
  page = signal(1);
  limit = 20;
  loading = signal(false);

  menuItems: MenuItem[] = [];
  activeItem: TrackedItem | null = null;

  constructor(
    private getPage: GetTrackedItemsPageUseCase,
    private deleteItem: DeleteTrackedItemUseCase,
    private confirmService: ConfirmationService,
    private router: Router
  ) {}

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total() / this.limit));
  }

  get hasPrev(): boolean {
    return this.page() > 1;
  }

  get hasNext(): boolean {
    return this.page() < this.totalPages;
  }

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const result = await this.getPage.execute(this.page(), this.limit);
      this.items.set(result.items);
      this.total.set(result.total);
    } catch (err) {
      console.error('Failed to load page:', err);
      this.items.set([]);
      this.total.set(0);
    } finally {
      this.loading.set(false);
    }
  }

  async prev(): Promise<void> {
    if (!this.hasPrev) return;
    this.page.update((p) => p - 1);
    await this.load();
  }

  async next(): Promise<void> {
    if (!this.hasNext) return;
    this.page.update((p) => p + 1);
    await this.load();
  }

  openMenu(event: Event, item: TrackedItem, menu: any): void {
    event.stopPropagation();
    this.activeItem = item;
    this.menuItems = [
      {
        label: 'Открыть',
        icon: 'pi pi-external-link',
        command: () => this.router.navigate(['/items', item.id]),
      },
      {
        label: 'Редактировать',
        icon: 'pi pi-pencil',
        command: () => this.router.navigate(['/items', item.id, 'edit'], {
          queryParams: { returnTo: 'list' },
        }),
      },
      { separator: true },
      {
        label: 'Удалить',
        icon: 'pi pi-trash',
        command: () => this.confirmDelete(item),
      },
    ];
    menu.toggle(event);
  }

  private confirmDelete(item: TrackedItem): void {
    this.confirmService.confirm({
      message: `Удалить "${item.artistName} — ${item.title}"? Действие нельзя отменить.`,
      header: 'Удаление',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Удалить',
      rejectLabel: 'Отмена',
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        try {
          await this.deleteItem.execute(item.id);
          await this.reloadAfterDelete();
        } catch (err) {
          console.error('Delete failed:', err);
        }
      },
    });
  }

  private async reloadAfterDelete(): Promise<void> {
    await this.load();
    if (this.items().length === 0 && this.page() > 1) {
      this.page.update((p) => p - 1);
      await this.load();
    }
  }
}