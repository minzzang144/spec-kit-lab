import { http, HttpResponse } from 'msw';
import {
  getCategoryList,
  getNoteList,
  addCategory,
  deleteCategory,
} from './mockStore';

export const categoryReadHandler = [
  http.get('/api/categories', () => {
    return HttpResponse.json({ data: getCategoryList() });
  }),

  http.get('/api/categories/:id/notes-count', ({ params }) => {
    const { id } = params;
    const category = getCategoryList().find((c) => c.id === id);

    if (!category) {
      return HttpResponse.json(
        {
          error: 'Not Found',
          message: '카테고리를 찾을 수 없습니다.',
          statusCode: 404,
        },
        { status: 404 },
      );
    }

    const count = getNoteList().filter((n) => n.categoryId === id).length;
    return HttpResponse.json({ data: { count } });
  }),
];

export const categoryWriteHandler = [
  http.post('/api/categories', async ({ request }) => {
    const body = (await request.json()) as { name?: string };

    if (!body.name || body.name.trim().length === 0) {
      return HttpResponse.json(
        {
          error: 'Bad Request',
          message: '카테고리 이름을 입력해주세요.',
          statusCode: 400,
        },
        { status: 400 },
      );
    }

    const trimmedName = body.name.trim();
    const isDuplicate = getCategoryList().some((c) => c.name === trimmedName);

    if (isDuplicate) {
      return HttpResponse.json(
        {
          error: 'Bad Request',
          message: '이미 존재하는 카테고리 이름입니다.',
          statusCode: 400,
        },
        { status: 400 },
      );
    }

    const newCategory = addCategory(trimmedName);
    return HttpResponse.json({ data: newCategory }, { status: 201 });
  }),

  http.delete('/api/categories/:id', ({ params }) => {
    const { id } = params;
    const category = getCategoryList().find((c) => c.id === id);

    if (!category) {
      return HttpResponse.json(
        {
          error: 'Not Found',
          message: '카테고리를 찾을 수 없습니다.',
          statusCode: 404,
        },
        { status: 404 },
      );
    }

    if (category.isDefault) {
      return HttpResponse.json(
        {
          error: 'Bad Request',
          message: '기본 카테고리는 삭제할 수 없습니다.',
          statusCode: 400,
        },
        { status: 400 },
      );
    }

    const result = deleteCategory(id as string);
    return HttpResponse.json({
      message: '카테고리가 삭제되었습니다.',
      movedNotesCount: result.movedCount,
    });
  }),
];
