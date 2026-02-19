import type { Category } from '#/Entities/Category';

export type CreateCategoryRequest = {
  readonly name: string;
};

export type CreateCategoryResponse = Category;
