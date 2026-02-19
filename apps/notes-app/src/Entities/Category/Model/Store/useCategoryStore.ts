import { create } from 'zustand';
import { createFilterSlice } from './FilterSlice';
import type { FilterSlice } from './FilterSlice';

type CategoryStoreState = FilterSlice;

export const useCategoryStore = create<CategoryStoreState>()((...a) => ({
  ...createFilterSlice(...a),
}));
