import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrackedItemTextFragment } from '../../../domain/tracked-item/models/tracked-item-text-fragment.entity';

@Component({
  selector: 'app-fragment-toc',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fragment-toc.component.html',
  styleUrls: ['./fragment-toc.component.scss'],
})
export class FragmentTocComponent {
  @Input() fragments: TrackedItemTextFragment[] = [];

  getLabel(fragment: TrackedItemTextFragment): string {
    if (fragment.title && fragment.title.trim().length > 0) {
      return fragment.title;
    }
    const preview = fragment.text.trim().slice(0, 40);
    return preview.length < fragment.text.trim().length
      ? `${preview}…`
      : preview || 'Без названия';
  }
}