import { Injectable } from '@angular/core';
import { Comment } from '../../domain/comment/models/comment.entity';
import { TTagLinkTarget } from '../../domain/tag/models/tag-link.entity';

const COMMENT_BASE = 'rgba(184, 160, 216, 0.35)';
const COMMENT_HOVER = 'rgba(184, 160, 216, 0.7)';
const TAG_BASE = 'rgba(100, 150, 200, 0.7)';
const TAG_HOVER = 'rgba(100, 150, 200, 1)';

export interface IHighlighterTagInput {
  id: string;
  target: TTagLinkTarget;
}

@Injectable()
export class AnnotationHighlighterService {
  private commentRanges = new Map<string, Range>();
  private tagRanges = new Map<string, Range>();
  private styleEl: HTMLStyleElement | null = null;
  private hoveredCommentId: string | null = null;
  private hoveredTagId: string | null = null;

  highlight(
    textEl: HTMLElement,
    comments: Comment[],
    tags: IHighlighterTagInput[] = []
  ): void {
    if (!('highlights' in CSS)) return;
    this.removeOwnHighlights();
    this.commentRanges.clear();
    this.tagRanges.clear();

    for (const c of comments) {
      if (c.target.type !== 'fragment-range') continue;
      const range = this.createRange(textEl, c.target.start, c.target.end);
      if (!range) continue;
      this.commentRanges.set(c.id, range);
    }

    for (const t of tags) {
      if (t.target.type !== 'fragment-range') continue;
      const range = this.createRange(textEl, t.target.start, t.target.end);
      if (!range) continue;
      this.tagRanges.set(t.id, range);
    }

    this.render();
  }

  setHoveredComment(commentId: string | null): void {
    if (this.hoveredCommentId === commentId) return;
    this.hoveredCommentId = commentId;
    this.render();
  }

  setHoveredTag(tagLinkId: string | null): void {
    if (this.hoveredTagId === tagLinkId) return;
    this.hoveredTagId = tagLinkId;
    this.render();
  }

  getCommentIdsAt(x: number, y: number): string[] {
    const result: string[] = [];
    for (const [id, range] of this.commentRanges.entries()) {
      if (this.rectsContainPoint(range, x, y)) result.push(id);
    }
    return result;
  }

  getTagIdsAt(x: number, y: number): string[] {
    const result: string[] = [];
    for (const [id, range] of this.tagRanges.entries()) {
      if (this.rectsContainPoint(range, x, y)) result.push(id);
    }
    return result;
  }

  hitTestComment(x: number, y: number): string | null {
    for (const [id, range] of this.commentRanges.entries()) {
      if (this.rectsContainPoint(range, x, y)) return id;
    }
    return null;
  }

  hitTestTag(x: number, y: number): string | null {
    for (const [id, range] of this.tagRanges.entries()) {
      if (this.rectsContainPoint(range, x, y)) return id;
    }
    return null;
  }

  scrollToAnnotation(commentId: string): boolean {
    const range = this.commentRanges.get(commentId);
    if (!range) return false;
    if (!this.scrollToRange(range)) return false;
    this.flash(commentId, 'comment');
    return true;
  }

  scrollToTag(tagLinkId: string): boolean {
    const range = this.tagRanges.get(tagLinkId);
    if (!range) return false;
    if (!this.scrollToRange(range)) return false;
    this.flash(tagLinkId, 'tag');
    return true;
  }

  clear(): void {
    this.removeOwnHighlights();
    this.commentRanges.clear();
    this.tagRanges.clear();
    this.hoveredCommentId = null;
    this.hoveredTagId = null;
    if (this.styleEl) {
      this.styleEl.remove();
      this.styleEl = null;
    }
  }

  private scrollToRange(range: Range): boolean {
    const rects = range.getClientRects();
    if (rects.length === 0) return false;
    const container = range.startContainer.parentElement;
    if (container) {
      container.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return true;
  }

  private rectsContainPoint(range: Range, x: number, y: number): boolean {
    const rects = range.getClientRects();
    for (const r of rects) {
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        return true;
      }
    }
    return false;
  }

  private removeOwnHighlights(): void {
    if (!('highlights' in CSS)) return;
    for (const id of this.commentRanges.keys()) {
      CSS.highlights.delete('comment-' + id);
    }
    for (const id of this.tagRanges.keys()) {
      CSS.highlights.delete('tag-' + id);
    }
  }

  private flash(id: string, kind: 'comment' | 'tag'): void {
    if (!('highlights' in CSS)) return;
    const range =
      kind === 'comment'
        ? this.commentRanges.get(id)
        : this.tagRanges.get(id);
    if (!range) return;

    const name = `${kind}-flash-${id}`;
    CSS.highlights.set(name, new Highlight(range));

    const style = document.createElement('style');
    if (kind === 'comment') {
      style.textContent = `::highlight(${name}) { background-color: rgba(184, 160, 216, 0.8); }`;
    } else {
      style.textContent = `::highlight(${name}) { text-decoration: underline; text-decoration-color: rgba(100, 150, 200, 1); text-decoration-thickness: 3px; }`;
    }
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

    for (const [id, range] of this.commentRanges.entries()) {
      CSS.highlights.set('comment-' + id, new Highlight(range));
      const color =
        this.hoveredCommentId === id ? COMMENT_HOVER : COMMENT_BASE;
      css.push(
        `::highlight(comment-${id}) { background-color: ${color}; }`
      );
    }

    for (const [id, range] of this.tagRanges.entries()) {
      CSS.highlights.set('tag-' + id, new Highlight(range));
      const color = this.hoveredTagId === id ? TAG_HOVER : TAG_BASE;
      css.push(
        `::highlight(tag-${id}) { text-decoration: underline; text-decoration-color: ${color}; text-decoration-thickness: 2px; }`
      );
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