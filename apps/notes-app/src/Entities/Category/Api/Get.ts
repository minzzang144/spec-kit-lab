import { httpClient } from '#/Shared/Api';

import type { Category } from '../Type/Category';

export async function getCategoryList(): Promise<Category[]> {
	return httpClient.get<Category[]>('/categories');
}
