import {
  Component,
  OnInit,
  signal,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProgressBarModule } from 'primeng/progressbar';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { ConfirmationService } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';

import { GetTrackedItemByIdUseCase } from '../../application/tracked-item/use-cases/get-tracked-item-by-id.use-case';
import { ToggleFragmentUseCase } from '../../application/tracked-item/use-cases/toggle-fragment.use-case';
import { RemoveFragmentUseCase } from '../../application/tracked-item/use-cases/remove-fragment.use-case';
import { AddFragmentUseCase } from '../../application/tracked-item/use-cases/add-fragment.use-case';
import { DeleteTrackedItemUseCase } from '../../application/tracked-item/use-cases/delete-tracked-item.use-case';
import { MarkFragmentReviewedUseCase } from '../../application/tracked-item/use-cases/mark-fragment-reviewed.use-case';
import { UpdateFragmentUseCase } from '../../application/tracked-item/use-cases/update-fragment.use-case';
import { AddCommentUseCase } from '../../application/comment/use-cases/add-comment.use-case';
import { DeleteCommentUseCase } from '../../application/comment/use-cases/delete-comment.use-case';
import { GetCommentsByTrackedItemUseCase } from '../../application/comment/use-cases/get-comments-by-tracked-item.use-case';

import { TrackedItem } from '../../domain/tracked-item/models/tracked-item.entity';
import { Comment } from '../../domain/comment/models/comment.entity';
import { SelectionService } from '../../core/services/selection.service';
import { FragmentCardComponent } from './fragment-card/fragment-card.component';

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
    AddCommentUseCase,
    DeleteCommentUseCase,
    GetCommentsByTrackedItemUseCase,
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

  comments = signal<Comment[]>([]);

  pendingSelection = signal<{
    fragmentId: string;
    start: number;
    end: number;
    quote: string;
    rect: DOMRect;
  } | null>(null);

  showCommentDialog = signal(false);
  newCommentText = signal('');
  savingComment = signal(false);

  @ViewChild('fragmentsContainer') fragmentsContainer?: ElementRef<HTMLElement>;

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
    private confirmService: ConfirmationService,
    private selectionService: SelectionService,
    private addComment: AddCommentUseCase,
    private deleteComment: DeleteCommentUseCase,
    private getCommentsByTrackedItem: GetCommentsByTrackedItemUseCase
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
      const item = await this.getById.execute(this.id);
      this.item.set(item);
      this.comments.set(await this.getCommentsByTrackedItem.execute(this.id));
    } catch (err) {
      console.error('Failed to load item:', err);
      this.item.set(null);
      this.comments.set([]);
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
      const updated = await this.updateFragment.execute(
        this.id,
        event.fragmentId,
        {
          text: event.text,
          title: event.title,
        }
      );
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
      this.comments.update((list) =>
        list.filter(
          (c) =>
            !(
              c.target.type === 'fragment-range' &&
              c.target.fragmentId === fragmentId
            )
        )
      );
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

  // ---------- Комментарии ----------

  commentsForFragment(fragmentId: string): Comment[] {
    return this.comments().filter(
      (c) =>
        c.target.type === 'fragment-range' && c.target.fragmentId === fragmentId
    );
  }

  commentsForItem(): Comment[] {
    return this.comments().filter((c) => c.target.type === 'tracked-item');
  }

  onFragmentsMouseUp(event: MouseEvent): void {
    const container = this.fragmentsContainer?.nativeElement;
    if (!container) return;

    const target = event.target as HTMLElement;
    const fragmentEl = target.closest('[data-fragment-id]') as HTMLElement | null;
    if (!fragmentEl) {
      this.pendingSelection.set(null);
      return;
    }

    const textEl = fragmentEl.querySelector('.fragment-text') as HTMLElement | null;
    if (!textEl) {
      this.pendingSelection.set(null);
      return;
    }

    const selection = this.selectionService.getSelectionWithin(textEl);
    if (!selection) {
      this.pendingSelection.set(null);
      return;
    }

    const rect = this.selectionService.getSelectionRect();
    if (!rect) {
      this.pendingSelection.set(null);
      return;
    }

    const fragmentId = fragmentEl.dataset['fragmentId'];
    if (!fragmentId) {
      this.pendingSelection.set(null);
      return;
    }

    this.pendingSelection.set({
      fragmentId,
      start: selection.start,
      end: selection.end,
      quote: selection.quote,
      rect,
    });
  }

  get floatingButtonStyle(): Record<string, string> {
    const pending = this.pendingSelection();
    if (!pending) return {};
    const rect = pending.rect;
    return {
      position: 'fixed',
      top: `${rect.top - 44}px`,
      left: `${rect.left + rect.width / 2}px`,
      transform: 'translateX(-50%)',
      'z-index': '1000',
    };
  }

  openCommentDialog(): void {
    const pending = this.pendingSelection();
    if (!pending) return;
    this.newCommentText.set('');
    this.showCommentDialog.set(true);
  }

  cancelCommentDialog(): void {
    this.showCommentDialog.set(false);
    this.newCommentText.set('');
    this.pendingSelection.set(null);
    this.selectionService.clear();
  }

  async submitComment(): Promise<void> {
    const text = this.newCommentText().trim();
    const pending = this.pendingSelection();
    if (!text || !pending) return;

    this.savingComment.set(true);
    try {
      const comment = await this.addComment.execute(text, {
        type: 'fragment-range',
        trackedItemId: this.id,
        fragmentId: pending.fragmentId,
        start: pending.start,
        end: pending.end,
        quote: pending.quote,
      });
      this.comments.update((list) => [...list, comment]);
      this.cancelCommentDialog();
    } catch (err) {
      console.error('Add comment failed:', err);
    } finally {
      this.savingComment.set(false);
    }
  }

  async deleteCommentById(id: string): Promise<void> {
    if (!confirm('Удалить комментарий?')) return;
    try {
      await this.deleteComment.execute(id);
      this.comments.update((list) => list.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Delete comment failed:', err);
    }
  }
}