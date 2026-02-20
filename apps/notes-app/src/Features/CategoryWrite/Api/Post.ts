import type { Category } from '#/Entities/Category';

import { httpClient } from '#/Shared/Api';

import type { CreateCategoryRequest } from '../Type/CategoryWrite';

export async function postCategory(
	payload: CreateCategoryRequest,
): Promise<Category> {
	return httpClient.post<Category>('/categories', payload);
}
