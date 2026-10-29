import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProgressBarModule } from 'primeng/progressbar';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { ConfirmationService } from 'primeng/api';

import { GetTrackedItemByIdUseCase } from '../../application/tracked-item/use-cases/get-tracked-item-by-id.use-case';
import { ToggleFragmentUseCase } from '../../application/tracked-item/use-cases/toggle-fragment.use-case';
import { RemoveFragmentUseCase } from '../../application/tracked-item/use-cases/remove-fragment.use-case';
import { AddFragmentUseCase } from '../../application/tracked-item/use-cases/add-fragment.use-case';
import { DeleteTrackedItemUseCase } from '../../application/tracked-item/use-cases/delete-tracked-item.use-case';
import { MarkFragmentReviewedUseCase } from '../../application/tracked-item/use-cases/mark-fragment-reviewed.use-case';
import { UpdateFragmentUseCase } from '../../application/tracked-item/use-cases/update-fragment.use-case';

import { TrackedItem } from '../../domain/tracked-item/models/tracked-item.entity';
import { FragmentCardComponent } from './fragment-card/fragment-card.component';

import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-tracked-item-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ProgressBarModule,
    ButtonModule,
    FormsModule,
    TextareaModule,
    CheckboxModule,
    InputTextModule,
    FragmentCardComponent,
  ],
  templateUrl: './tracked-item-detail.component.html',
  styleUrls: ['./tracked-item-detail.component.scss'],
  providers: [
    GetTrackedItemByIdUseCase,
    ToggleFragmentUseCase,
    RemoveFragmentUseCase,
    AddFragmentUseCase,
    DeleteTrackedItemUseCase,
    MarkFragmentReviewedUseCase,
    UpdateFragmentUseCase,
  ],
})
export class TrackedItemDetailComponent implements OnInit {
  item = signal<TrackedItem | null>(null);
  loading = signal(false);
  id!: string;

  adding = signal(false);
  newFragmentText = signal('');
  saving = signal(false);
  newFragmentTitle = signal('');
  newFragmentIsDone = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private getById: GetTrackedItemByIdUseCase,
    private toggleFragment: ToggleFragmentUseCase,
    private removeFragment: RemoveFragmentUseCase,
    private addFragment: AddFragmentUseCase,
    private deleteItem: DeleteTrackedItemUseCase,
    private markReviewed: MarkFragmentReviewedUseCase,
    private updateFragment: UpdateFragmentUseCase,
    private confirmService: ConfirmationService
  ) {}

  async ngOnInit(): Promise<void> {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.id) {
      this.router.navigate(['/']);
      return;
    }
    await this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      this.item.set(await this.getById.execute(this.id));
    } catch (err) {
      console.error('Failed to load item:', err);
      this.item.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  async onToggleDone(event: { fragmentId: string; done: boolean }): Promise<void> {
    try {
      const updated = await this.toggleFragment.execute(
        this.id,
        event.fragmentId,
        event.done
      );
      this.item.set(updated);
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  }

  async onMarkReviewed(fragmentId: string): Promise<void> {
    try {
      const updated = await this.markReviewed.execute(this.id, fragmentId);
      this.item.set(updated);
    } catch (err) {
      console.error('Mark reviewed failed:', err);
    }
  }

  async onUpdateFragment(event: {
    fragmentId: string;
    text: string;
    title: string;
  }): Promise<void> {
    try {
      const updated = await this.updateFragment.execute(this.id, event.fragmentId, {
        text: event.text,
        title: event.title,
      });
      this.item.set(updated);
    } catch (err) {
      console.error('Update fragment failed:', err);
    }
  }

  async onRemoveFragment(fragmentId: string): Promise<void> {
    if (!confirm('Удалить фрагмент?')) return;
    try {
      const updated = await this.removeFragment.execute(this.id, fragmentId);
      this.item.set(updated);
    } catch (err) {
      console.error('Remove fragment failed:', err);
    }
  }

  get completedCount(): number {
    return this.item()?.fragments.filter((f) => f.isDone).length ?? 0;
  }

  startAdd(): void {
    this.adding.set(true);
    this.newFragmentText.set('');
    this.newFragmentTitle.set('');
    this.newFragmentIsDone.set(false);
  }

  cancelAdd(): void {
    this.adding.set(false);
    this.newFragmentText.set('');
    this.newFragmentTitle.set('');
    this.newFragmentIsDone.set(false);
  }

  async submitAdd(): Promise<void> {
    const text = this.newFragmentText().trim();
    if (!text) return;

    const current = this.item();
    if (!current) return;

    this.saving.set(true);
    try {
      const updated = await this.addFragment.execute(
        this.id,
        {
          text,
          title: this.newFragmentTitle().trim(),
          isDone: this.newFragmentIsDone(),
        },
        current.fragments.length
      );
      this.item.set(updated);
      this.cancelAdd();
    } catch (err) {
      console.error('Add fragment failed:', err);
    } finally {
      this.saving.set(false);
    }
  }

  onDelete(): void {
    const it = this.item();
    if (!it) return;

    this.confirmService.confirm({
      message: `Удалить "${it.artistName} — ${it.title}"? Действие нельзя отменить.`,
      header: 'Удаление',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Удалить',
      rejectLabel: 'Отмена',
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        try {
          await this.deleteItem.execute(this.id);
          this.router.navigate(['/']);
        } catch (err) {
          console.error('Delete failed:', err);
        }
      },
    });
  }
}