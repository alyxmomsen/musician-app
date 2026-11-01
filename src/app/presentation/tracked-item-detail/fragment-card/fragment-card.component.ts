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
  HostListener,
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
  providers: [AnnotationHighlighterService], // ← per-component instance
})
export class FragmentCardComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @Input({ required: true }) fragment!: TrackedItemTextFragment;
  @Input({ required: true }) trackedItemId!: string;
  @Input() comments: Comment[] = [];
  @Input() profiles: Map<string, TUserProfile> = new Map();

  @Output() toggleDone = new EventEmitter<{ fragmentId: string; done: boolean }>();
  @Output() markReviewed = new EventEmitter<string>();
  @Output() update = new EventEmitter<{
    fragmentId: string;
    text: string;
    title: string;
  }>();
  @Output() delete = new EventEmitter<string>();
  @Output() deleteComment = new EventEmitter<string>();

  isExpanded = signal(false);
  isEditing = signal(false);

  editTitle = signal('');
  editText = signal('');
  saving = signal(false);

  @ViewChild('fragmentText') fragmentText?: ElementRef<HTMLElement>;

  popup = signal<{ x: number; y: number; commentIds: string[] } | null>(null);

  private lastCommentsKey = '';

  menuItems: MenuItem[] = [
    { label: 'Редактировать', icon: 'pi pi-pencil', command: () => this.startEdit() },
    { label: 'Удалить', icon: 'pi pi-trash', command: () => this.delete.emit(this.fragment.id) },
  ];

  constructor(private highlighter: AnnotationHighlighterService) {}

  ngAfterViewInit(): void {
    this.applyHighlight();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const c = changes['comments'];
    if (!c) return;
    const key = this.commentsKey(this.comments);
    if (key !== this.lastCommentsKey) {
      this.lastCommentsKey = key;
      setTimeout(() => this.applyHighlight(), 0);
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
    // после смены DOM (clamped → expanded) viewchild обновится, ranges надо пересоздать
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

  getAuthorName(authorId: string): string {
    return this.profiles.get(authorId)?.displayName ?? 'Неизвестный';
  }

  onCommentClick(commentId: string, event: MouseEvent): void {
    event.stopPropagation();

    if (!this.isExpanded()) {
      this.isExpanded.set(true);
      setTimeout(() => {
        this.applyHighlight();
        setTimeout(() => {
          this.highlighter.scrollToAnnotation(commentId);
        }, 0);
      }, 0);
      return;
    }

    this.highlighter.scrollToAnnotation(commentId);
  }

  onCommentHover(commentId: string): void {
    this.highlighter.setHovered(commentId);
  }

  onCommentLeave(): void {
    this.highlighter.setHovered(null);
  }

  onCardMouseMove(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // не трогаем hover, если мышь не над текстом
    if (
      target.closest('.fragment-comment') ||
      target.closest('.fragment-footer') ||
      target.closest('.fragment-header') ||
      target.closest('.annotation-popup') ||
      target.closest('.edit-form')
    ) {
      return;
    }

    const hovered = this.highlighter.hitTest(event.clientX, event.clientY);
    this.highlighter.setHovered(hovered);
  }

  onCardMouseLeave(): void {
    this.highlighter.setHovered(null);
  }

  onTextClick(event: MouseEvent): void {
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed && sel.toString().trim().length > 0) {
      return;
    }

    const ids = this.highlighter.getCommentIdsAt(event.clientX, event.clientY);
    if (ids.length === 0) {
      if (this.popup()) {
        this.closePopup();
        return;
      }
      this.toggleExpand();
      return;
    }
    this.popup.set({ x: event.clientX, y: event.clientY, commentIds: ids });
  }

  closePopup(): void {
    this.popup.set(null);
  }

  selectFromPopup(commentId: string): void {
    this.closePopup();
    this.scrollToCommentInList(commentId);
  }

  getCommentById(id: string): Comment | undefined {
    return this.comments.find((c) => c.id === id);
  }

  private scrollToCommentInList(commentId: string): void {
    const el = document.querySelector(
      `[data-comment-id="${commentId}"]`
    ) as HTMLElement | null;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const inViewport = rect.top >= 0 && rect.bottom <= window.innerHeight;

    if (!inViewport) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    el.classList.add('flash');
    setTimeout(() => el.classList.remove('flash'), 1200);
  }

  private commentsKey(comments: Comment[]): string {
    return comments.map((c) => c.id).join(',');
  }

  private applyHighlight(): void {
    const el = this.fragmentText?.nativeElement;
    if (el) this.highlighter.highlight(el, this.comments);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.popup()) return;
    const target = event.target as HTMLElement;

    // клик внутри popup — не закрываем
    if (target.closest('.annotation-popup')) return;

    // клик по тексту — popup закрывается/переоткрывается в onTextClick
    if (target.closest('.fragment-text')) return;

    this.closePopup();
  }
}