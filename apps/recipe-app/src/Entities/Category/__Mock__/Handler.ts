import { http, HttpResponse } from 'msw';

import { getCategoryList } from './Db';

export const categoryEntityHandler = [
	http.get('/api/categories', () => {
		return HttpResponse.json(getCategoryList());
	}),
];
