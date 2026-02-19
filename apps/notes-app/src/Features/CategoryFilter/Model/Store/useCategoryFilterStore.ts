import { create } from 'zustand';
import { createFilterSlice } from './FilterSlice';
import type { FilterSlice } from './FilterSlice';

export const useCategoryFilterStore = create<FilterSlice>()((...a) => ({
  ...createFilterSlice(...a),
}));
