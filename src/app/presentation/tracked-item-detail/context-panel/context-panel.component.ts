import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';

import { Comment } from '../../../domain/comment/models/comment.entity';
import { HashTag } from '../../../domain/tag/models/hash-tag.entity';
import { TUserProfile } from '../../../domain/user/ports/user-profiles.repository.port';

@Component({
  selector: 'app-context-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    TooltipModule,
  ],
  templateUrl: './context-panel.component.html',
  styleUrls: ['./context-panel.component.scss'],
})
export class ContextPanelComponent {
  @Input() open: boolean = false;
  @Input() title: string = '';
  @Input() subtitle: string | null = null;

  @Input() comments: Comment[] = [];
  @Input() commentTags: Map<string, HashTag[]> = new Map();
  @Input() tags: HashTag[] = [];
  @Input() profiles: Map<string, TUserProfile> = new Map();

  @Output() close = new EventEmitter<void>();
  @Output() deleteComment = new EventEmitter<string>();
  @Output() removeTag = new EventEmitter<string>();
  @Output() addAnnotation = new EventEmitter<{
    comment: string;
    tags: string[];
  }>();

  adding = signal(false);
  newCommentText = signal('');
  newAnnotationTags = signal('');

  onClose(): void {
    this.close.emit();
  }

  onDeleteComment(id: string): void {
    this.deleteComment.emit(id);
  }

  onRemoveTag(tagId: string): void {
    this.removeTag.emit(tagId);
  }

  getAuthorName(authorId: string): string {
    return this.profiles.get(authorId)?.displayName ?? 'Неизвестный';
  }

  getTagsForComment(commentId: string): HashTag[] {
    return this.commentTags.get(commentId) ?? [];
  }

  formatDate(ts: number): string {
    const diff = Date.now() - ts;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Сегодня';
    if (days === 1) return 'Вчера';
    if (days < 7) return `${days} дн. назад`;
    return new Date(ts).toLocaleDateString('ru-RU');
  }

  startAdd(): void {
    this.adding.set(true);
    this.newCommentText.set('');
    this.newAnnotationTags.set('');
  }

  cancelAdd(): void {
    this.adding.set(false);
    this.newCommentText.set('');
    this.newAnnotationTags.set('');
  }

  submitAdd(): void {
    const comment = this.newCommentText().trim();
    const tagsInput = this.newAnnotationTags().trim();
    const tags =
      tagsInput.length > 0
        ? tagsInput.split(/\s+/).filter((t) => t.length > 0)
        : [];

    if (!comment && tags.length === 0) return;

    this.addAnnotation.emit({ comment, tags });
    this.cancelAdd();
  }
}