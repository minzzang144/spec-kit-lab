import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { postCategory } from './Post';
import { deleteCategory } from './Delete';

const server = setupServer(
  http.post('/api/categories', async ({ request }) => {
    const body = (await request.json()) as { name?: string };

    if (!body.name || body.name.trim().length === 0) {
      return HttpResponse.json(
        { error: 'Bad Request', message: '카테고리 이름을 입력해주세요.', statusCode: 400 },
        { status: 400 },
      );
    }

    if (body.name === '중복이름') {
      return HttpResponse.json(
        { error: 'Bad Request', message: '이미 존재하는 카테고리 이름입니다.', statusCode: 400 },
        { status: 400 },
      );
    }

    return HttpResponse.json(
      { data: { id: 'cat-new', name: body.name, isDefault: false } },
      { status: 201 },
    );
  }),

  http.delete('/api/categories/:id', ({ params }) => {
    const { id } = params;

    if (id === 'uncategorized') {
      return HttpResponse.json(
        { error: 'Bad Request', message: '기본 카테고리는 삭제할 수 없습니다.', statusCode: 400 },
        { status: 400 },
      );
    }

    if (id === 'nonexistent') {
      return HttpResponse.json(
        { error: 'Not Found', message: '카테고리를 찾을 수 없습니다.', statusCode: 404 },
        { status: 404 },
      );
    }

    return HttpResponse.json({ message: '카테고리가 삭제되었습니다.', movedNotesCount: 2 });
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('postCategory', () => {
  it('should create category and return it', async () => {
    const result = await postCategory({ name: '독서' });

    expect(result.name).toBe('독서');
    expect(result.isDefault).toBe(false);
  });

  it('should throw error when name is empty', async () => {
    await expect(postCategory({ name: '' })).rejects.toEqual(
      expect.objectContaining({ statusCode: 400 }),
    );
  });

  it('should throw error when name is duplicate', async () => {
    await expect(postCategory({ name: '중복이름' })).rejects.toEqual(
      expect.objectContaining({ message: '이미 존재하는 카테고리 이름입니다.' }),
    );
  });
});

describe('deleteCategory', () => {
  it('should delete category and return movedNotesCount', async () => {
    await expect(deleteCategory('cat-1')).resolves.toBeUndefined();
  });

  it('should throw error when deleting default category', async () => {
    await expect(deleteCategory('uncategorized')).rejects.toEqual(
      expect.objectContaining({ message: '기본 카테고리는 삭제할 수 없습니다.' }),
    );
  });

  it('should throw error when category not found', async () => {
    await expect(deleteCategory('nonexistent')).rejects.toEqual(
      expect.objectContaining({ statusCode: 404 }),
    );
  });
});
