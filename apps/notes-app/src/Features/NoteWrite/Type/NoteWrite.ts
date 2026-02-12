import type { Note } from '#/Entities/Note';

export type CreateNoteRequest = {
  readonly title: string;
  readonly content?: string;
  readonly categoryId?: string;
};

export type CreateNoteResponse = Note;
