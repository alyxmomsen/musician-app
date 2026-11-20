import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ProgressBarModule } from 'primeng/progressbar';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { InputTextModule } from 'primeng/inputtext';
import { ChipModule } from 'primeng/chip';
import { MenuItem } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { GetTrackedItemsPageUseCase } from '../../application/tracked-item/use-cases/get-tracked-items-page.use-case';
import { SearchTrackedItemsUseCase } from '../../application/tracked-item/use-cases/search-tracked-items.use-case';
import { DeleteTrackedItemUseCase } from '../../application/tracked-item/use-cases/delete-tracked-item.use-case';
import { TrackedItem } from '../../domain/tracked-item/models/tracked-item.entity';

@Component({
  selector: 'app-tracked-item-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ProgressBarModule,
    ButtonModule,
    MenuModule,
    InputTextModule,
    ChipModule,
  ],
  templateUrl: './tracked-item-list.component.html',
  styleUrls: ['./tracked-item-list.component.scss'],
  providers: [
    GetTrackedItemsPageUseCase,
    SearchTrackedItemsUseCase,
    DeleteTrackedItemUseCase,
  ],
})
export class TrackedItemListComponent implements OnInit, OnDestroy {
  items = signal<TrackedItem[]>([]);
  total = signal(0);
  page = signal(1);
  limit = 20;
  loading = signal(false);

  searchInput = signal('');
  appliedQuery = signal('');
  selectedTags = signal<string[]>([]);
  matchedTagsByItemId = signal<Record<string, string[]>>({});

  menuItems: MenuItem[] = [];
  activeItem: TrackedItem | null = null;

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  hasActiveFilters = computed(
    () => this.appliedQuery().trim().length > 0 || this.selectedTags().length > 0
  );

  constructor(
    private getPage: GetTrackedItemsPageUseCase,
    private searchItems: SearchTrackedItemsUseCase,
    private deleteItem: DeleteTrackedItemUseCase,
    private confirmService: ConfirmationService,
    private router: Router,
    private route: ActivatedRoute
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
    const params = this.route.snapshot.queryParamMap;
    const q = params.get('q') ?? '';
    const tagsRaw = params.get('tags') ?? '';
    const tags = tagsRaw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    this.searchInput.set(q);
    this.appliedQuery.set(q);
    this.selectedTags.set(tags);

    await this.load();
  }

  ngOnDestroy(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
  }

  onSearchInput(value: string): void {
    this.searchInput.set(value);
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.appliedQuery.set(this.searchInput().trim());
      this.page.set(1);
      void this.syncUrlAndLoad();
    }, 300);
  }

  removeTagFilter(tag: string): void {
    this.selectedTags.update((list) => list.filter((t) => t !== tag));
    this.page.set(1);
    void this.syncUrlAndLoad();
  }

  clearFilters(): void {
    this.searchInput.set('');
    this.appliedQuery.set('');
    this.selectedTags.set([]);
    this.page.set(1);
    void this.syncUrlAndLoad();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      if (this.hasActiveFilters()) {
        const result = await this.searchItems.execute({
          q: this.appliedQuery() || undefined,
          tags:
            this.selectedTags().length > 0 ? this.selectedTags() : undefined,
          page: this.page(),
          limit: this.limit,
        });
        this.items.set(result.items);
        this.total.set(result.total);
        this.matchedTagsByItemId.set(result.matchedTagsByItemId ?? {});
      } else {
        const result = await this.getPage.execute(this.page(), this.limit);
        this.items.set(result.items);
        this.total.set(result.total);
        this.matchedTagsByItemId.set({});
      }
    } catch (err) {
      console.error('Failed to load page:', err);
      this.items.set([]);
      this.total.set(0);
      this.matchedTagsByItemId.set({});
    } finally {
      this.loading.set(false);
    }
  }

  private async syncUrlAndLoad(): Promise<void> {
    const queryParams: Record<string, string | null> = {};
    const q = this.appliedQuery().trim();
    const tags = this.selectedTags();

    queryParams['q'] = q || null;
    queryParams['tags'] = tags.length > 0 ? tags.join(',') : null;

    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });

    await this.load();
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

  openMenu(event: Event, item: TrackedItem, menu: { toggle: (e: Event) => void }): void {
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
        command: () =>
          this.router.navigate(['/items', item.id, 'edit'], {
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
