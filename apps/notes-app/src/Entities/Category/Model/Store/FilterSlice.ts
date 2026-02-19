import type { StateCreator } from 'zustand';
import { ALL_CATEGORY_ID } from '../../Config';

export type FilterSlice = {
  selectedCategoryId: string;
};

export const createFilterSlice: StateCreator<FilterSlice> = () => ({
  selectedCategoryId: ALL_CATEGORY_ID,
});
