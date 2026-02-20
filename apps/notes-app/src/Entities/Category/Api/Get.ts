import { httpClient } from '#/Shared/Api';

import type { Category } from '../Type';

export async function getCategoryList(): Promise<Category[]> {
	return httpClient.get<Category[]>('/categories');
}
