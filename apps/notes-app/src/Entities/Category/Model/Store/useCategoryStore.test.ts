import { beforeEach, describe, expect, it } from 'vitest';
import { ALL_CATEGORY_ID } from '../../Config';
import { useCategoryStore } from './useCategoryStore';

beforeEach(() => {
  useCategoryStore.setState({ selectedCategoryId: ALL_CATEGORY_ID });
});

describe('useCategoryStore', () => {
  it('초기 selectedCategoryId는 ALL_CATEGORY_ID이다', () => {
    expect(useCategoryStore.getState().selectedCategoryId).toBe(ALL_CATEGORY_ID);
  });

  it('setState로 selectedCategoryId를 변경할 수 있다', () => {
    useCategoryStore.setState({ selectedCategoryId: 'cat-1' });

    expect(useCategoryStore.getState().selectedCategoryId).toBe('cat-1');
  });

  it('ALL_CATEGORY_ID로 초기화할 수 있다', () => {
    useCategoryStore.setState({ selectedCategoryId: 'cat-1' });
    useCategoryStore.setState({ selectedCategoryId: ALL_CATEGORY_ID });

    expect(useCategoryStore.getState().selectedCategoryId).toBe(ALL_CATEGORY_ID);
  });
});
