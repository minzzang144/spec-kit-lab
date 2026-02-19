import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { putNote } from './Put';

const EXISTING_NOTE_ID = 'note-1';

const server = setupServer(
  http.put('/api/notes/:id', async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as {
      title?: string;
      content?: string;
      categoryId?: string;
    };

    if (body.title !== undefined && body.title.trim().length === 0) {
      return HttpResponse.json(
        { error: 'Bad Request', message: '제목을 입력해주세요.', statusCode: 400 },
        { status: 400 },
      );
    }

    if (id === 'nonexistent') {
      return HttpResponse.json(
        { error: 'Not Found', message: '노트를 찾을 수 없습니다.', statusCode: 404 },
        { status: 404 },
      );
    }

    return HttpResponse.json({
      data: {
        id,
        title: body.title ?? '기존 제목',
        content: body.content ?? '',
        categoryId: body.categoryId ?? 'uncategorized',
        createdAt: '2026-02-10T09:00:00.000Z',
        updatedAt: '2026-02-19T10:00:00.000Z',
      },
    });
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('putNote', () => {
  it('should send PUT request and return updated note', async () => {
    const result = await putNote(EXISTING_NOTE_ID, {
      title: '수정된 제목',
      content: '수정된 내용',
    });

    expect(result.id).toBe(EXISTING_NOTE_ID);
    expect(result.title).toBe('수정된 제목');
    expect(result.content).toBe('수정된 내용');
    expect(result.updatedAt).toBe('2026-02-19T10:00:00.000Z');
  });

  it('should allow partial update (only title)', async () => {
    const result = await putNote(EXISTING_NOTE_ID, { title: '제목만 수정' });

    expect(result.title).toBe('제목만 수정');
  });

  it('should throw error when title is empty string', async () => {
    await expect(putNote(EXISTING_NOTE_ID, { title: '' })).rejects.toEqual(
      expect.objectContaining({
        error: 'Bad Request',
        message: '제목을 입력해주세요.',
        statusCode: 400,
      }),
    );
  });

  it('should throw error when note not found', async () => {
    await expect(putNote('nonexistent', { title: '수정' })).rejects.toEqual(
      expect.objectContaining({
        error: 'Not Found',
        statusCode: 404,
      }),
    );
  });
});
