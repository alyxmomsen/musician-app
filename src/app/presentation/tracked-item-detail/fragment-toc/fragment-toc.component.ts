import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TFragmentTocItem } from './fragment-toc.types';

@Component({
  selector: 'app-fragment-toc',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fragment-toc.component.html',
  styleUrls: ['./fragment-toc.component.scss'],
})
export class FragmentTocComponent {
  @Input() items: TFragmentTocItem[] = [];
  @Output() itemClick = new EventEmitter<string>();

  onClick(id: string): void {
    this.itemClick.emit(id);
  }
}