import {
  Component,
  OnInit,
  signal,
  computed,       // ← должно быть
  ViewChild,
  ElementRef,
  Inject,
  HostListener,
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
import { Comment, TCommentTarget } from '../../domain/comment/models/comment.entity';
import { SelectionService } from '../../core/services/selection.service';
import { FragmentCardComponent } from './fragment-card/fragment-card.component';

import { TagChipsComponent } from '../shared/tag-chips/tag-chips.component';

import { AuthService } from '../../core/services/auth.service';

import {
  UserProfilesRepositoryPort,
  TUserProfile,
} from '../../domain/user/ports/user-profiles.repository.port';
import { USER_PROFILES_REPOSITORY_TOKEN } from '../../core/tokens/user-profiles-repository.token';

import { AddAnnotationUseCase } from '../../application/comment/use-cases/add-annotation.use-case';

import { FragmentTocComponent } from './fragment-toc/fragment-toc.component';
import { ContextPanelComponent } from './context-panel/context-panel.component';

import { GetTagsForTrackedItemUseCase } from '../../application/tag/use-cases/get-tags-for-tracked-item.use-case';
import { HashTag } from '../../domain/tag/models/hash-tag.entity';
import { TTagLinkTarget } from '../../domain/tag/models/tag-link.entity';
import { TFragmentTocItem } from './fragment-toc/fragment-toc.types';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';
  // если HostListener/computed уже есть — не дублируй
import { TContext } from './context-panel/context-panel.types';

import { GetTagsForCommentsUseCase } from '../../application/tag/use-cases/get-tags-for-comments.use-case';

import { RemoveTagUseCase } from '../../application/tag/use-cases/remove-tag.use-case';

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

    TagChipsComponent,

    FragmentTocComponent,
    ContextPanelComponent,

    MenuModule,
    TooltipModule,
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
    AddAnnotationUseCase,
    DeleteCommentUseCase,
    GetCommentsByTrackedItemUseCase,
    GetTagsForTrackedItemUseCase,
    GetTagsForCommentsUseCase,
    RemoveTagUseCase,
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

  profiles = signal<Map<string, TUserProfile>>(new Map());

  newAnnotationTags = signal('');

  showItemCommentDialog = signal(false);
  newItemCommentText = signal('');
  newItemCommentTags = signal('');
  savingItemComment = signal(false);

  contextPanelOpen = signal(false);

  allTags = signal<Array<{ tag: HashTag; target: TTagLinkTarget }>>([]);

  tocItems = computed<TFragmentTocItem[]>(() => {
    const it = this.item();
    if (!it) return [];

    const comments = this.comments();
    const tags = this.allTags();

    return it.fragments.map((f) => {
      const label = f.title && f.title.trim().length > 0
        ? f.title.trim()
        : f.text.trim().slice(0, 40) + (f.text.trim().length > 40 ? '…' : '');

      const commentCount = comments.filter(
        (c) =>
          (c.target.type === 'fragment-range' && c.target.fragmentId === f.id) ||
          (c.target.type === 'fragment' && c.target.fragmentId === f.id)
      ).length;

      const tagCount = tags.filter(
        (t) =>
          (t.target.type === 'fragment' && t.target.fragmentId === f.id) ||
          (t.target.type === 'fragment-range' && t.target.fragmentId === f.id)
      ).length;

      return {
        id: f.id,
        label: label || 'Без названия',
        isDone: f.isDone,
        commentCount,
        tagCount,
      };
    });
  });

  selectedContext = signal<TContext | null>(null);

  tocMap = computed<Map<string, TFragmentTocItem>>(() => {
    const map = new Map<string, TFragmentTocItem>();
    for (const item of this.tocItems()) map.set(item.id, item);
    return map;
  });

  contextTitle = computed<string>(() => {
    const ctx = this.selectedContext();
    if (!ctx) return '';
    const it = this.item();
    switch (ctx.type) {
      case 'tracked-item':
        return 'Трек';
      case 'fragment': {
        const fragment = it?.fragments.find((f) => f.id === ctx.fragmentId);
        return fragment?.title?.trim() || 'Фрагмент';
      }
      case 'fragment-range':
        return 'Диапазон текста';
    }
  });

  contextSubtitle = computed<string | null>(() => {
    const ctx = this.selectedContext();
    if (ctx?.type === 'fragment-range') return ctx.quote;
    return null;
  });

  commentTags = signal<Map<string, HashTag[]>>(new Map());


  contextComments = computed<Comment[]>(() => {
    const ctx = this.selectedContext();
    if (!ctx) return [];
    const all = this.comments();

    if (ctx.type === 'tracked-item') {
      return all.filter((c) => c.target.type === 'tracked-item');
    }

    if (ctx.type === 'fragment') {
      return all.filter(
        (c) =>
          c.target.type === 'fragment' &&
          c.target.fragmentId === ctx.fragmentId
      );
    }

    if (ctx.type === 'fragment-range') {
      return all.filter(
        (c) =>
          c.target.type === 'fragment-range' &&
          c.target.fragmentId === ctx.fragmentId &&
          c.target.start === ctx.start &&
          c.target.end === ctx.end
      );
    }

    return [];
  });

  contextTags = computed<HashTag[]>(() => {
    const ctx = this.selectedContext();
    if (!ctx) return [];
    const all = this.allTags();

    if (ctx.type === 'tracked-item') {
      return all
        .filter((t) => t.target.type === 'tracked-item')
        .map((t) => t.tag);
    }

    if (ctx.type === 'fragment') {
      return all
        .filter(
          (t) =>
            t.target.type === 'fragment' &&
            t.target.fragmentId === ctx.fragmentId
        )
        .map((t) => t.tag);
    }

    if (ctx.type === 'fragment-range') {
      return all
        .filter(
          (t) =>
            t.target.type === 'fragment-range' &&
            t.target.fragmentId === ctx.fragmentId &&
            t.target.start === ctx.start &&
            t.target.end === ctx.end
        )
        .map((t) => t.tag);
    }

    return [];
  });

  expandTrigger = signal<string | null>(null);

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
    private addAnnotation: AddAnnotationUseCase,
    private deleteComment: DeleteCommentUseCase,
    private getCommentsByTrackedItem: GetCommentsByTrackedItemUseCase,
    private auth: AuthService,

    @Inject(USER_PROFILES_REPOSITORY_TOKEN)
    private readonly profilesRepo: UserProfilesRepositoryPort,
    private getTagsForTrackedItem: GetTagsForTrackedItemUseCase,
    private getTagsForComments: GetTagsForCommentsUseCase,

    private removeTag: RemoveTagUseCase,
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

      const comments = await this.getCommentsByTrackedItem.execute(this.id);
      this.comments.set(comments);

      const tags = await this.getTagsForTrackedItem.execute(this.id);
      this.allTags.set(tags);

      const authorIds = Array.from(new Set(comments.map((c) => c.authorId)));
      this.profiles.set(await this.profilesRepo.getByUserIds(authorIds));

      const commentIds = comments.map((c) => c.id);
      const commentTags = await this.getTagsForComments.execute(commentIds);
      this.commentTags.set(commentTags);

    } catch (err) {
      console.error('Failed to load item:', err);
      this.item.set(null);
      this.comments.set([]);
      this.allTags.set([]);

      this.commentTags.set(new Map());

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
        (c.target.type === 'fragment-range' && c.target.fragmentId === fragmentId) ||
        (c.target.type === 'fragment' && c.target.fragmentId === fragmentId)
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
    this.newAnnotationTags.set('');
    this.showCommentDialog.set(true);
  }

  cancelCommentDialog(): void {
    this.showCommentDialog.set(false);
    this.newCommentText.set('');
    this.newAnnotationTags.set('');
    this.pendingSelection.set(null);
    this.selectionService.clear();
  }

  async submitAnnotation(): Promise<void> {
    const comment = this.newCommentText().trim();
    const tagsInput = this.newAnnotationTags().trim();
    const tags = tagsInput.length > 0
      ? tagsInput.split(/\s+/).filter((t) => t.length > 0)
      : [];

    if (!comment && tags.length === 0) return;

    const pending = this.pendingSelection();
    if (!pending) return;

    this.savingComment.set(true);
    try {
      const result = await this.addAnnotation.execute(
        comment || null,
        tags,
        {
          type: 'fragment-range',
          trackedItemId: this.id,
          fragmentId: pending.fragmentId,
          start: pending.start,
          end: pending.end,
          quote: pending.quote,
        }
      );

      if (result.comment) {
        this.comments.update((list) => [...list, result.comment!]);
      }

      // текущий пользователь — в profiles (без HTTP)
      const me = this.auth.user();
      if (me) {
        const next = new Map(this.profiles());
        next.set(me.id, { userId: me.id, displayName: me.displayName });
        this.profiles.set(next);
      }

      this.cancelCommentDialog();
      this.reloadTags();

      if (result.tags.length > 0) {
        await this.reloadCommentTags();
      }

    } catch (err) {
      console.error('Add annotation failed:', err);
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

  getAuthorName(authorId: string): string {
    return this.profiles().get(authorId)?.displayName ?? 'Неизвестный';
  }

  async onAddFragmentComment(event: {
    fragmentId: string;
    comment: string;
    tags: string[];
  }): Promise<void> {
    try {
      const result = await this.addAnnotation.execute(
        event.comment || null,
        event.tags,
        {
          type: 'fragment',
          trackedItemId: this.id,
          fragmentId: event.fragmentId,
        }
      );

      if (result.comment) {
        this.comments.update((list) => [...list, result.comment!]);
      }

      if (result.tags.length > 0) {
        await this.reloadCommentTags();
      }

      const me = this.auth.user();
      if (me) {
        const next = new Map(this.profiles());
        next.set(me.id, { userId: me.id, displayName: me.displayName });
        this.profiles.set(next);
      }
      await this.reloadTags();
    } catch (err) {
      console.error('Add fragment comment failed:', err);
    }
  }

  startAddItemComment(): void {
    this.newItemCommentText.set('');
    this.newItemCommentTags.set('');
    this.showItemCommentDialog.set(true);
  }

  cancelAddItemComment(): void {
    this.showItemCommentDialog.set(false);
    this.newItemCommentText.set('');
    this.newItemCommentTags.set('');
  }

  async submitAddItemComment(): Promise<void> {
    const comment = this.newItemCommentText().trim();
    const tagsInput = this.newItemCommentTags().trim();
    const tags = tagsInput.length > 0
      ? tagsInput.split(/\s+/).filter((t) => t.length > 0)
      : [];

    if (!comment && tags.length === 0) return;

    this.savingItemComment.set(true);
    try {
      const result = await this.addAnnotation.execute(
        comment || null,
        tags,
        {
          type: 'tracked-item',
          trackedItemId: this.id,
        }
      );

      if (result.comment) {
        this.comments.update((list) => [...list, result.comment!]);
      }

      if (result.tags.length > 0) {
        await this.reloadTags();

        await this.reloadCommentTags();
      }

      const me = this.auth.user();
      if (me) {
        const next = new Map(this.profiles());
        next.set(me.id, { userId: me.id, displayName: me.displayName });
        this.profiles.set(next);
      }

      this.cancelAddItemComment();
    } catch (err) {
      console.error('Add item comment failed:', err);
    } finally {
      this.savingItemComment.set(false);
    }
  }

  openContextPanel(): void {
    this.contextPanelOpen.set(true);
  }

  closeContextPanel(): void {
    this.contextPanelOpen.set(false);
  }

  scrollToFragment(fragmentId: string): void {
    const el = document.querySelector(
      `[data-fragment-id="${fragmentId}"]`
    ) as HTMLElement | null;
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async reloadTags(): Promise<void> {
    try {
      this.allTags.set(await this.getTagsForTrackedItem.execute(this.id));
    } catch (err) {
      console.error('Failed to reload tags:', err);
    }
  }

  openFragmentContext(event: {
    fragmentId: string;
    range?: { start: number; end: number; quote: string };
  }): void {
    if (event.range) {
      this.selectedContext.set({
        type: 'fragment-range',
        fragmentId: event.fragmentId,
        start: event.range.start,
        end: event.range.end,
        quote: event.range.quote,
      });
    } else {
      this.selectedContext.set({
        type: 'fragment',
        fragmentId: event.fragmentId,
      });
    }
  }

  closeContext(): void {
    this.selectedContext.set(null);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.selectedContext()) {
      this.closeContext();
    }
  }

  async reloadCommentTags(): Promise<void> {
    try {
      const commentIds = this.comments().map((c) => c.id);
      this.commentTags.set(
        await this.getTagsForComments.execute(commentIds)
      );
    } catch (err) {
      console.error('Failed to reload comment tags:', err);
    }
  }

  async onPanelDeleteComment(id: string): Promise<void> {
    await this.deleteCommentById(id);
    await this.reloadCommentTags();
    await this.reloadTags();
  }

  async onPanelRemoveTag(tagId: string): Promise<void> {
    const ctx = this.selectedContext();
    if (!ctx) return;

    let target: TTagLinkTarget | null = null;
    if (ctx.type === 'tracked-item') {
      target = { type: 'tracked-item', trackedItemId: this.id };
    } else if (ctx.type === 'fragment') {
      target = {
        type: 'fragment',
        trackedItemId: this.id,
        fragmentId: ctx.fragmentId,
      };
    } else if (ctx.type === 'fragment-range') {
      target = {
        type: 'fragment-range',
        trackedItemId: this.id,
        fragmentId: ctx.fragmentId,
        start: ctx.start,
        end: ctx.end,
        quote: ctx.quote,
      };
    }
    if (!target) return;

    try {
      await this.removeTag.execute(tagId, target);
      await this.reloadTags();
    } catch (err) {
      console.error('Remove tag failed:', err);
    }
  }

  async onPanelAddAnnotation(event: {
    comment: string;
    tags: string[];
  }): Promise<void> {
    const ctx = this.selectedContext();
    if (!ctx) return;

    let target: TCommentTarget | null = null;
    if (ctx.type === 'tracked-item') {
      target = { type: 'tracked-item', trackedItemId: this.id };
    } else if (ctx.type === 'fragment') {
      target = {
        type: 'fragment',
        trackedItemId: this.id,
        fragmentId: ctx.fragmentId,
      };
    } else if (ctx.type === 'fragment-range') {
      target = {
        type: 'fragment-range',
        trackedItemId: this.id,
        fragmentId: ctx.fragmentId,
        start: ctx.start,
        end: ctx.end,
        quote: ctx.quote,
      };
    }
    if (!target) return;

    try {
      const result = await this.addAnnotation.execute(
        event.comment || null,
        event.tags,
        target
      );

      if (result.comment) {
        this.comments.update((list) => [...list, result.comment!]);
      }

      const me = this.auth.user();
      if (me) {
        const next = new Map(this.profiles());
        next.set(me.id, { userId: me.id, displayName: me.displayName });
        this.profiles.set(next);
      }

      if (result.tags.length > 0) {
        await this.reloadCommentTags();
        await this.reloadTags();
      }
    } catch (err) {
      console.error('Add annotation failed:', err);
    }
  }

  onTocItemClick(fragmentId: string): void {
    // 1. Развернуть фрагмент
    this.expandTrigger.set(fragmentId);
    // 2. Скролл (с небольшой задержкой, чтобы DOM обновился)
    setTimeout(() => {
      this.scrollToFragment(fragmentId);
      this.openFragmentContext({ fragmentId });
      // сброс, чтобы следующий клик на тот же фрагмент сработал
      this.expandTrigger.set(null);
    }, 50);
  }

}