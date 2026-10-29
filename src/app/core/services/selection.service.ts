import { Injectable } from '@angular/core';

export interface ISelectionResult {
  start: number;
  end: number;
  quote: string;
}

@Injectable({ providedIn: 'root' })
export class SelectionService {
  /**
   * Возвращает выделение, если оно целиком внутри переданного элемента.
   * start/end считаются относительно текстового содержимого элемента
   * (с учётом вложенных span'ов, если они есть).
   */
  getSelectionWithin(element: HTMLElement): ISelectionResult | null {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      return null;
    }

    const range = sel.getRangeAt(0);

    if (!element.contains(range.commonAncestorContainer)) {
      return null;
    }

    const quote = range.toString();
    if (quote.trim().length === 0) {
      return null;
    }

    // start = длина текста от начала элемента до начала выделения
    const preRange = range.cloneRange();
    preRange.selectNodeContents(element);
    preRange.setEnd(range.startContainer, range.startOffset);
    const start = preRange.toString().length;

    const end = start + quote.length;

    return { start, end, quote };
  }

  clear(): void {
    window.getSelection()?.removeAllRanges();
  }

  /**
   * Координаты выделения в вьюпорте — для позиционирования floating-кнопки.
   */
  getSelectionRect(): DOMRect | null {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      return null;
    }
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      return null;
    }
    return rect;
  }
}