import { beforeEach, describe, expect, it } from 'vitest';
import { useCategoryFilterStore } from './useCategoryFilterStore';

beforeEach(() => {
  useCategoryFilterStore.setState({ selectedCategoryId: 'all' });
});

describe('useCategoryFilterStore', () => {
  it('should have initial selectedCategoryId as "all"', () => {
    const state = useCategoryFilterStore.getState();

    expect(state.selectedCategoryId).toBe('all');
  });

  it('should update selectedCategoryId when setSelectedCategoryId is called', () => {
    useCategoryFilterStore.getState().setSelectedCategoryId('cat-1');

    expect(useCategoryFilterStore.getState().selectedCategoryId).toBe('cat-1');
  });

  it('should reset to "all" when setSelectedCategoryId is called with "all"', () => {
    useCategoryFilterStore.getState().setSelectedCategoryId('cat-1');
    useCategoryFilterStore.getState().setSelectedCategoryId('all');

    expect(useCategoryFilterStore.getState().selectedCategoryId).toBe('all');
  });
});
