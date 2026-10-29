import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { HashTag } from '../../../domain/tag/models/hash-tag.entity';
import { TTagLinkTarget } from '../../../domain/tag/models/tag-link.entity';
import { GetTagsForTargetUseCase } from '../../../application/tag/use-cases/get-tags-for-target.use-case';
import { AddTagUseCase } from '../../../application/tag/use-cases/add-tag.use-case';
import { RemoveTagUseCase } from '../../../application/tag/use-cases/remove-tag.use-case';

@Component({
  selector: 'app-tag-chips',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule],
  templateUrl: './tag-chips.component.html',
  styleUrls: ['./tag-chips.component.scss'],
  providers: [GetTagsForTargetUseCase, AddTagUseCase, RemoveTagUseCase],
})
export class TagChipsComponent implements OnInit {
  @Input({ required: true }) target!: TTagLinkTarget;

  tags = signal<HashTag[]>([]);
  loading = signal(false);
  adding = signal(false);
  newTagText = signal('');
  saving = signal(false);

  constructor(
    private getTags: GetTagsForTargetUseCase,
    private addTag: AddTagUseCase,
    private removeTag: RemoveTagUseCase
  ) {}

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      this.tags.set(await this.getTags.execute(this.target));
    } catch (err) {
      console.error('Failed to load tags:', err);
      this.tags.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  startAdd(): void {
    this.adding.set(true);
    this.newTagText.set('');
  }

  cancelAdd(): void {
    this.adding.set(false);
    this.newTagText.set('');
  }

  async submitAdd(): Promise<void> {
    const input = this.newTagText().trim();
    if (!input) return;

    // Пробел — разделитель, поэтому шлём по одному тегу
    const parts = input.split(/\s+/).filter((p) => p.length > 0);

    this.saving.set(true);
    try {
      for (const part of parts) {
        const tag = await this.addTag.execute(part, this.target);
        // не дублируем, если уже есть (бэк идемпотентен, но массив всё равно)
        this.tags.update((list) =>
          list.some((t) => t.id === tag.id) ? list : [...list, tag]
        );
      }
      this.cancelAdd();
    } catch (err) {
      console.error('Add tag failed:', err);
    } finally {
      this.saving.set(false);
    }
  }

  async removeTagById(tagId: string): Promise<void> {
    try {
      await this.removeTag.execute(tagId, this.target);
      this.tags.update((list) => list.filter((t) => t.id !== tagId));
    } catch (err) {
      console.error('Remove tag failed:', err);
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.submitAdd();
    } else if (event.key === 'Escape') {
      this.cancelAdd();
    }
  }
}