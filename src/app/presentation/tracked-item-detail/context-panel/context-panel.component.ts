import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-context-panel',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './context-panel.component.html',
  styleUrls: ['./context-panel.component.scss'],
})
export class ContextPanelComponent {
  @Input() open: boolean = false;
  @Input() title: string = '';
  @Input() subtitle: string | null = null;
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }
}