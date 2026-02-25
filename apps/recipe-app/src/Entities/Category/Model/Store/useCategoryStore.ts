import { create } from 'zustand';

import type { FilterSlice } from './FilterSlice';
import { createFilterSlice } from './FilterSlice';

type CategoryStoreState = FilterSlice;

export const useCategoryStore = create<CategoryStoreState>()((...a) => ({
	...createFilterSlice(...a),
}));
