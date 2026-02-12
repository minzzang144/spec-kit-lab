import { http, HttpResponse } from 'msw';
import { getNoteList } from '#/Entities/Note/__Mock__';
import { getCategoryList } from './Db';

export const categoryEntityHandler = [
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
