import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
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
})
export class FragmentCardComponent {
  @Input({ required: true }) fragment!: TrackedItemTextFragment;

  @Output() toggleDone = new EventEmitter<{ fragmentId: string; done: boolean }>();
  @Output() markReviewed = new EventEmitter<string>();
  @Output() update = new EventEmitter<{ fragmentId: string; text: string; title: string }>();
  @Output() delete = new EventEmitter<string>();

  isExpanded = signal(false);
  isEditing = signal(false);

  editTitle = signal('');
  editText = signal('');
  saving = signal(false);

  menuItems: MenuItem[] = [
    { label: 'Редактировать', icon: 'pi pi-pencil', command: () => this.startEdit() },
    { label: 'Удалить', icon: 'pi pi-trash', command: () => this.delete.emit(this.fragment.id) },
  ];

  onToggleDone(done: boolean): void {
    this.toggleDone.emit({ fragmentId: this.fragment.id, done });
  }

  onMarkReviewed(): void {
    this.markReviewed.emit(this.fragment.id);
  }

  toggleExpand(): void {
    this.isExpanded.update((v) => !v);
  }

  startEdit(): void {
    this.editTitle.set(this.fragment.title);
    this.editText.set(this.fragment.text);
    this.isEditing.set(true);
    this.isExpanded.set(true);
  }

  cancelEdit(): void {
    this.isEditing.set(false);
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
}