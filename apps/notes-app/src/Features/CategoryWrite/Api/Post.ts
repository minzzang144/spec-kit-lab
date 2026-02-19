import { httpClient } from '#/Shared/Api';
import type { Category } from '#/Entities/Category';
import type { CreateCategoryRequest } from '../Type';

export async function postCategory(payload: CreateCategoryRequest): Promise<Category> {
  return httpClient.post<Category>('/categories', payload);
}
