import { Injectable } from '@angular/core';
import { Comment } from '../../domain/comment/models/comment.entity';

const BASE_COLOR = 'rgba(184, 160, 216, 0.32)';
const HOVER_COLOR = 'rgba(184, 160, 216, 0.55)';

@Injectable()
export class AnnotationHighlighterService {
  private ranges = new Map<string, Range>();
  private styleEl: HTMLStyleElement | null = null;
  private hoveredId: string | null = null;

  highlight(textEl: HTMLElement, comments: Comment[]): void {
    if (!('highlights' in CSS)) return;
    this.removeOwnHighlights();
    this.ranges.clear();

    for (const c of comments) {
      if (c.target.type !== 'fragment-range') continue;
      const range = this.createRange(textEl, c.target.start, c.target.end);
      if (!range) continue;
      this.ranges.set(c.id, range);
    }

    this.render();
  }

  setHovered(commentId: string | null): void {
    if (this.hoveredId === commentId) return;
    this.hoveredId = commentId;
    this.render();
  }

  hitTest(x: number, y: number): string | null {
    for (const [id, range] of this.ranges.entries()) {
      const rects = range.getClientRects();
      for (const r of rects) {
        if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
          return id;
        }
      }
    }
    return null;
  }

  getCommentIdsAt(x: number, y: number): string[] {
    const result: string[] = [];
    for (const [id, range] of this.ranges.entries()) {
      const rects = range.getClientRects();
      for (const r of rects) {
        if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
          result.push(id);
          break;
        }
      }
    }
    return result;
  }

  scrollToAnnotation(commentId: string): boolean {
    const range = this.ranges.get(commentId);
    if (!range) return false;
    const rects = range.getClientRects();
    if (rects.length === 0) return false;

    const first = rects[0];
    const inViewport = first.top >= 0 && first.bottom <= window.innerHeight;

    if (!inViewport) {
      const target = window.scrollY + first.top - window.innerHeight / 3;
      window.scrollTo({ top: target, behavior: 'smooth' });
    }

    this.flash(commentId);
    return true;
  }

  clear(): void {
    this.removeOwnHighlights();
    this.ranges.clear();
    this.hoveredId = null;
    if (this.styleEl) {
      this.styleEl.remove();
      this.styleEl = null;
    }
  }

  private removeOwnHighlights(): void {
    if (!('highlights' in CSS)) return;
    for (const id of this.ranges.keys()) {
      CSS.highlights.delete('ann-' + id);
    }
  }

  private flash(commentId: string): void {
    if (!('highlights' in CSS)) return;
    const range = this.ranges.get(commentId);
    if (!range) return;
    const name = 'ann-flash-' + commentId;
    CSS.highlights.set(name, new Highlight(range));
    const style = document.createElement('style');
    style.textContent = `::highlight(${name}) { background-color: rgba(184, 160, 216, 0.75); }`;
    document.head.appendChild(style);
    setTimeout(() => {
      CSS.highlights.delete(name);
      style.remove();
    }, 1200);
  }

  private render(): void {
    if (!('highlights' in CSS)) return;

    this.removeOwnHighlights();

    if (!this.styleEl) {
      this.styleEl = document.createElement('style');
      document.head.appendChild(this.styleEl);
    }

    const css: string[] = [];

    for (const [id, range] of this.ranges.entries()) {
      CSS.highlights.set('ann-' + id, new Highlight(range));
      const color = this.hoveredId === id ? HOVER_COLOR : BASE_COLOR;
      css.push(`::highlight(ann-${id}) { background-color: ${color}; }`);
    }

    this.styleEl.textContent = css.join('\n');
  }

  private createRange(
    el: HTMLElement,
    start: number,
    end: number
  ): Range | null {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    let pos = 0;
    let startNode: Text | null = null;
    let startOffset = 0;
    let endNode: Text | null = null;
    let endOffset = 0;

    while ((node = walker.nextNode())) {
      const text = node as Text;
      const len = text.length;
      if (!startNode && pos + len >= start) {
        startNode = text;
        startOffset = start - pos;
      }
      if (startNode && pos + len >= end) {
        endNode = text;
        endOffset = end - pos;
        break;
      }
      pos += len;
    }

    if (!startNode || !endNode) return null;
    const range = document.createRange();
    range.setStart(startNode, startOffset);
    range.setEnd(endNode, endOffset);
    return range;
  }
}