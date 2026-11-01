import { Component, Input, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { HashTag } from '../../../domain/tag/models/hash-tag.entity';
import { TTagLinkTarget } from '../../../domain/tag/models/tag-link.entity';
import { GetTagsForTargetUseCase } from '../../../application/tag/use-cases/get-tags-for-target.use-case';
import { AddTagUseCase } from '../../../application/tag/use-cases/add-tag.use-case';
import { RemoveTagUseCase } from '../../../application/tag/use-cases/remove-tag.use-case';
import { UpdateTagDescriptionUseCase } from '../../../application/tag/use-cases/update-tag-description.use-case';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-tag-chips',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    TooltipModule,
  ],
  templateUrl: './tag-chips.component.html',
  styleUrls: ['./tag-chips.component.scss'],
  providers: [
    GetTagsForTargetUseCase,
    AddTagUseCase,
    RemoveTagUseCase,
    UpdateTagDescriptionUseCase,
  ],
})
export class TagChipsComponent implements OnInit {
  @Input({ required: true }) target!: TTagLinkTarget;

  private auth = inject(AuthService);

  tags = signal<HashTag[]>([]);
  loading = signal(false);

  adding = signal(false);
  newTagText = signal('');
  newDescription = signal('');
  saving = signal(false);

  editingDescriptionFor = signal<string | null>(null);
  editDescription = signal('');
  savingDescription = signal(false);

  constructor(
    private getTags: GetTagsForTargetUseCase,
    private addTag: AddTagUseCase,
    private removeTag: RemoveTagUseCase,
    private updateDescription: UpdateTagDescriptionUseCase
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
    this.newDescription.set('');
  }

  cancelAdd(): void {
    this.adding.set(false);
    this.newTagText.set('');
    this.newDescription.set('');
  }

  async submitAdd(): Promise<void> {
    const input = this.newTagText().trim();
    if (!input) return;

    const parts = input.split(/\s+/).filter((p) => p.length > 0);
    const description = this.newDescription().trim();

    this.saving.set(true);
    try {
      for (const part of parts) {
        const tag = await this.addTag.execute(part, this.target, description);
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

  canEditDescription(tag: HashTag): boolean {
    return tag.createdBy === this.auth.user()?.id;
  }

  startEditDescription(tag: HashTag): void {
    this.editingDescriptionFor.set(tag.id);
    this.editDescription.set(tag.description);
  }

  cancelEditDescription(): void {
    this.editingDescriptionFor.set(null);
    this.editDescription.set('');
  }

  async submitEditDescription(tagId: string): Promise<void> {
    this.savingDescription.set(true);
    try {
      const updated = await this.updateDescription.execute(
        tagId,
        this.editDescription().trim()
      );
      this.tags.update((list) =>
        list.map((t) => (t.id === updated.id ? updated : t))
      );
      this.cancelEditDescription();
    } catch (err) {
      console.error('Update description failed:', err);
    } finally {
      this.savingDescription.set(false);
    }
  }
}