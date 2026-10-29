import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import { CreateTrackedItemUseCase } from '../../application/tracked-item/use-cases/create-tracked-item.use-case';
import { UpdateTrackedItemUseCase } from '../../application/tracked-item/use-cases/update-tracked-item.use-case';
import { GetTrackedItemByIdUseCase } from '../../application/tracked-item/use-cases/get-tracked-item-by-id.use-case';
import { ProgressBarModule } from 'primeng/progressbar';

interface FragmentDraft {
  title: string;
  text: string;
  isDone: boolean;
}

@Component({
  selector: 'app-tracked-item-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    InputTextModule,
    TextareaModule,
    ButtonModule,
    CheckboxModule,
    ProgressBarModule,
  ],
  templateUrl: './tracked-item-form.component.html',
  styleUrls: ['./tracked-item-form.component.scss'],
  providers: [
    CreateTrackedItemUseCase,
    UpdateTrackedItemUseCase,
    GetTrackedItemByIdUseCase,
  ],
})
export class TrackedItemFormComponent implements OnInit {
  isEdit = signal(false);
  id = signal<string | null>(null);

  artistName = signal('');
  title = signal('');

  fragments = signal<FragmentDraft[]>([]);

  loading = signal(false);
  saving = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private createItem: CreateTrackedItemUseCase,
    private updateItem: UpdateTrackedItemUseCase,
    private getById: GetTrackedItemByIdUseCase,
    private messageService: MessageService
  ) {}

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.id.set(id);
      this.loading.set(true);
      try {
        const item = await this.getById.execute(id);
        this.artistName.set(item.artistName);
        this.title.set(item.title);
      } catch (err) {
        console.error('Failed to load item:', err);
        this.router.navigate(['/']);
      } finally {
        this.loading.set(false);
      }
    }
  }

  addFragment(): void {
    this.fragments.update((list) => [
      ...list,
      { title: '', text: '', isDone: false },
    ]);
  }

  removeFragment(index: number): void {
    this.fragments.update((list) => list.filter((_, i) => i !== index));
  }

  updateFragment(index: number, patch: Partial<FragmentDraft>): void {
    this.fragments.update((list) =>
      list.map((f, i) => (i === index ? { ...f, ...patch } : f))
    );
  }

  async save(): Promise<void> {
    const artistName = this.artistName().trim();
    const title = this.title().trim();

    if (!artistName || !title) return;

    const invalidFragment = this.fragments().find((f) => !f.text.trim());
    if (invalidFragment) {
      this.messageService.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: 'У каждого фрагмента должен быть текст',
      });
      return;
    }

    this.saving.set(true);
    try {
      if (this.isEdit()) {
        const updated = await this.updateItem.execute(this.id()!, artistName, title);
        this.messageService.add({
          severity: 'success',
          summary: 'Сохранено',
          detail: 'Изменения применены',
        });

        const returnTo = this.route.snapshot.queryParamMap.get('returnTo');
        if (returnTo === 'list') {
          this.router.navigate(['/']);
        } else {
          this.router.navigate(['/items', updated.id]);
        }
      } else {
        const fragmentsInput = this.fragments().map((f) => ({
          title: f.title.trim(),
          text: f.text.trim(),
          isDone: f.isDone,
        }));
        const created = await this.createItem.execute(artistName, title, fragmentsInput);
        this.messageService.add({
          severity: 'success',
          summary: 'Создано',
          detail: 'Элемент добавлен',
        });
        this.router.navigate(['/items', created.id]);
      }
    } catch (err) {
      console.error('Save failed:', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: 'Не удалось сохранить',
      });
    } finally {
      this.saving.set(false);
    }
  }
}