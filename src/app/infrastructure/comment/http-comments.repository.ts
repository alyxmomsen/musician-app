import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  CommentsRepositoryPort,
} from '../../domain/comment/ports/comments.repository.port';
import { Comment, TCommentTarget } from '../../domain/comment/models/comment.entity';
import { CommentDto } from './comment.dto';

@Injectable()
export class HttpCommentsRepository implements CommentsRepositoryPort {
  private readonly apiUrl = '/api/comments';

  constructor(private http: HttpClient) {}

  async getByTrackedItem(trackedItemId: string): Promise<Comment[]> {
    const dtos = await firstValueFrom(
      this.http.get<CommentDto[]>(this.apiUrl, {
        params: { trackedItemId },
      })
    );
    return dtos.map((d) => this.toEntity(d));
  }

  async getByTarget(target: TCommentTarget): Promise<Comment[]> {
    const dtos = await firstValueFrom(
      this.http.post<CommentDto[]>(`${this.apiUrl}/by-target`, { target })
    );
    return dtos.map((d) => this.toEntity(d));
  }

  async create(text: string, target: TCommentTarget): Promise<Comment> {
    const dto = await firstValueFrom(
      this.http.post<CommentDto>(this.apiUrl, { text, target })
    );
    return this.toEntity(dto);
  }

  async update(id: string, text: string): Promise<Comment> {
    const dto = await firstValueFrom(
      this.http.patch<CommentDto>(`${this.apiUrl}/${id}`, { text })
    );
    return this.toEntity(dto);
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
  }

  private toEntity(dto: CommentDto): Comment {
    return {
      id: dto.id,
      text: dto.text,
      target: dto.target,
      authorId: dto.authorId,
      createdAt: dto.createdAt,
    };
  }
}