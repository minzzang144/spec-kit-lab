import type { Category } from '../Type';

import { CATEGORY_SEED_DATA } from './Seed';

let categoryList: Category[] = [...CATEGORY_SEED_DATA];

export function getCategoryList(): Category[] {
	return [...categoryList];
}

export function getCategoryById(id: string): Category | undefined {
	return categoryList.find((category) => category.id === id);
}

export function resetCategoryDb(): void {
	categoryList = [...CATEGORY_SEED_DATA];
}
