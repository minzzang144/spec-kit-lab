import { beforeEach, describe, expect, it } from 'vitest';
import { useFilterStore } from './useFilterStore';

beforeEach(() => {
  useFilterStore.setState({ selectedCategoryId: 'all' });
});

describe('useFilterStore', () => {
  it('should have initial selectedCategoryId as "all"', () => {
    const state = useFilterStore.getState();

    expect(state.selectedCategoryId).toBe('all');
  });

  it('should update selectedCategoryId when setSelectedCategoryId is called', () => {
    useFilterStore.getState().setSelectedCategoryId('cat-1');

    expect(useFilterStore.getState().selectedCategoryId).toBe('cat-1');
  });

  it('should reset to "all" when setSelectedCategoryId is called with "all"', () => {
    useFilterStore.getState().setSelectedCategoryId('cat-1');
    useFilterStore.getState().setSelectedCategoryId('all');

    expect(useFilterStore.getState().selectedCategoryId).toBe('all');
  });
});
