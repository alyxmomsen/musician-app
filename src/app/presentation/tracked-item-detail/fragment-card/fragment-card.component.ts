import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxClamp } from '@chitovas/ngx-clamp';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { MenuItem } from 'primeng/api';
import { TrackedItemTextFragment } from '../../../domain/tracked-item/models/tracked-item-text-fragment.entity';
import { Comment } from '../../../domain/comment/models/comment.entity';
import { TTagLinkTarget } from '../../../domain/tag/models/tag-link.entity';
import { TUserProfile } from '../../../domain/user/ports/user-profiles.repository.port';
import { AnnotationHighlighterService } from '../../../core/services/annotation-highlighter.service';

@Component({
  selector: 'app-fragment-card',
  standalone: true,
  imports: [
    CommonModule,
    NgxClamp,
    ButtonModule,
    CheckboxModule,
    FormsModule,
    MenuModule,
    TooltipModule,
    InputTextModule,
    TextareaModule,
  ],
  templateUrl: './fragment-card.component.html',
  styleUrls: ['./fragment-card.component.scss'],
  providers: [AnnotationHighlighterService],
})
export class FragmentCardComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @Input({ required: true }) fragment!: TrackedItemTextFragment;
  @Input({ required: true }) trackedItemId!: string;
  @Input() comments: Comment[] = [];
  @Input() tags: Array<{ id: string; target: TTagLinkTarget }> = [];
  @Input() profiles: Map<string, TUserProfile> = new Map();
  @Input() commentCount: number = 0;
  @Input() tagCount: number = 0;
  @Input() expandTrigger: string | null = null;
  @Input() scrollToComment: string | null = null;

  @Output() toggleDone = new EventEmitter<{ fragmentId: string; done: boolean }>();
  @Output() markReviewed = new EventEmitter<string>();
  @Output() update = new EventEmitter<{
    fragmentId: string;
    text: string;
    title: string;
  }>();
  @Output() delete = new EventEmitter<string>();
  @Output() addFragmentComment = new EventEmitter<{
    fragmentId: string;
    comment: string;
    tags: string[];
  }>();
  @Output() openContext = new EventEmitter<{
    fragmentId: string;
    range?: { start: number; end: number; quote: string };
    anchorCommentIds?: string[];
    anchorTagIds?: string[];
  }>();

  isExpanded = signal(false);
  isEditing = signal(false);

  editTitle = signal('');
  editText = signal('');
  saving = signal(false);

  showCommentDialog = signal(false);
  newCommentText = signal('');
  newAnnotationTags = signal('');
  savingComment = signal(false);

  @ViewChild('fragmentText') fragmentText?: ElementRef<HTMLElement>;

  private lastCommentsKey = '';

  menuItems: MenuItem[] = [
    {
      label: 'Комментарий к фрагменту',
      icon: 'pi pi-comment',
      command: () => this.startAddComment(),
    },
    {
      label: 'Редактировать',
      icon: 'pi pi-pencil',
      command: () => this.startEdit(),
    },
    {
      label: 'Удалить',
      icon: 'pi pi-trash',
      command: () => this.delete.emit(this.fragment.id),
    },
  ];

  constructor(private highlighter: AnnotationHighlighterService) {}

  ngAfterViewInit(): void {
    this.applyHighlight();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const c = changes['comments'];
    if (c) {
      const key = this.commentsKey(this.comments);
      if (key !== this.lastCommentsKey) {
        this.lastCommentsKey = key;
        setTimeout(() => this.applyHighlight(), 0);
      }
    }

    if (changes['tags']) {
      setTimeout(() => this.applyHighlight(), 0);
    }

    if (changes['expandTrigger'] && this.expandTrigger === this.fragment.id) {
      this.isExpanded.set(true);
      setTimeout(() => this.applyHighlight(), 0);
    }

    if (changes['scrollToComment'] && this.scrollToComment) {
      const belongs = this.comments.some((x) => x.id === this.scrollToComment);
      if (belongs) {
        setTimeout(() => {
          this.highlighter.scrollToAnnotation(this.scrollToComment!);
        }, 50);
      }
    }
  }

  ngOnDestroy(): void {
    this.highlighter.clear();
  }

  onToggleDone(done: boolean): void {
    this.toggleDone.emit({ fragmentId: this.fragment.id, done });
  }

  onMarkReviewed(): void {
    this.markReviewed.emit(this.fragment.id);
  }

  toggleExpand(): void {
    this.isExpanded.update((v) => !v);
    setTimeout(() => this.applyHighlight(), 0);
  }

  startEdit(): void {
    this.editTitle.set(this.fragment.title);
    this.editText.set(this.fragment.text);
    this.isEditing.set(true);
    this.isExpanded.set(true);
    this.highlighter.clear();
  }

  cancelEdit(): void {
    this.isEditing.set(false);
    setTimeout(() => this.applyHighlight(), 0);
  }

  submitEdit(): void {
    const text = this.editText().trim();
    if (!text) return;
    this.saving.set(true);
    this.update.emit({
      fragmentId: this.fragment.id,
      text,
      title: this.editTitle().trim(),
    });
    this.isEditing.set(false);
    this.saving.set(false);
  }

  formatReviewDate(timestamp: number | null): string {
    if (timestamp === null) return 'Никогда';
    const diff = Date.now() - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Сегодня';
    if (days === 1) return 'Вчера';
    if (days < 7) return `${days} дн. назад`;
    return new Date(timestamp).toLocaleDateString('ru-RU');
  }

  onIndicatorClick(): void {
    this.openContext.emit({ fragmentId: this.fragment.id });
  }

  startAddComment(): void {
    this.newCommentText.set('');
    this.newAnnotationTags.set('');
    this.showCommentDialog.set(true);
  }

  cancelAddComment(): void {
    this.showCommentDialog.set(false);
    this.newCommentText.set('');
    this.newAnnotationTags.set('');
  }

  submitAddComment(): void {
    const comment = this.newCommentText().trim();
    const tagsInput = this.newAnnotationTags().trim();
    const tags =
      tagsInput.length > 0
        ? tagsInput.split(/\s+/).filter((t) => t.length > 0)
        : [];

    if (!comment && tags.length === 0) return;

    this.addFragmentComment.emit({
      fragmentId: this.fragment.id,
      comment,
      tags,
    });
    this.cancelAddComment();
  }

  onCardMouseMove(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (
      target.closest('.fragment-footer') ||
      target.closest('.fragment-header') ||
      target.closest('.edit-form') ||
      target.closest('.fragment-indicators')
    ) {
      return;
    }
    const commentId = this.highlighter.hitTestComment(event.clientX, event.clientY);
    const tagId = this.highlighter.hitTestTag(event.clientX, event.clientY);
    this.highlighter.setHoveredComment(commentId);
    this.highlighter.setHoveredTag(tagId);
  }

  onCardMouseLeave(): void {
    this.highlighter.setHoveredComment(null);
    this.highlighter.setHoveredTag(null);
  }

  onTextClick(event: MouseEvent): void {
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed && sel.toString().trim().length > 0) {
      return;
    }

    const commentIds = this.highlighter.getCommentIdsAt(event.clientX, event.clientY);
    const tagIds = this.highlighter.getTagIdsAt(event.clientX, event.clientY);

    if (commentIds.length === 0 && tagIds.length === 0) {
      this.toggleExpand();
      return;
    }

    // определяем диапазон для контекста: приоритет у комментария
    let range: { start: number; end: number; quote: string } | null = null;

    if (commentIds.length > 0) {
      const c = this.comments.find((x) => x.id === commentIds[0]);
      if (c && c.target.type === 'fragment-range') {
        range = {
          start: c.target.start,
          end: c.target.end,
          quote: c.target.quote,
        };
      }
    }

    if (!range && tagIds.length > 0) {
      const t = this.tags.find((x) => x.id === tagIds[0]);
      if (t && t.target.type === 'fragment-range') {
        range = {
          start: t.target.start,
          end: t.target.end,
          quote: t.target.quote,
        };
      }
    }

    if (range) {
      this.openContext.emit({
        fragmentId: this.fragment.id,
        range,
        anchorCommentIds: commentIds,
        anchorTagIds: tagIds,
      });
    }
  }

  private commentsKey(comments: Comment[]): string {
    return comments.map((c) => c.id).join(',');
  }

  private applyHighlight(): void {
    const el = this.fragmentText?.nativeElement;
    if (el) this.highlighter.highlight(el, this.comments, this.tags);
  }
}