import { http, HttpResponse } from 'msw';
import { getNoteList } from './Db';

export const noteEntityHandler = [
  http.get('/api/notes', ({ request }) => {
    const url = new URL(request.url);
    const categoryId = url.searchParams.get('categoryId');
    const keyword = url.searchParams.get('keyword');
    const sort = url.searchParams.get('sort') ?? 'createdAt_desc';

    let result = [...getNoteList()];

    if (categoryId && categoryId !== 'all') {
      result = result.filter((note) => note.categoryId === categoryId);
    }

    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      result = result.filter(
        (note) =>
          note.title.toLowerCase().includes(lowerKeyword) ||
          note.content.toLowerCase().includes(lowerKeyword),
      );
    }

    if (sort === 'createdAt_desc') {
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } else {
      result.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    }

    return HttpResponse.json({ data: result });
  }),

  http.get('/api/notes/:id', ({ params }) => {
    const { id } = params;
    const note = getNoteList().find((n) => n.id === id);

    if (!note) {
      return HttpResponse.json(
        { error: 'Not Found', message: '노트를 찾을 수 없습니다.', statusCode: 404 },
        { status: 404 },
      );
    }

    return HttpResponse.json({ data: note });
  }),
];
