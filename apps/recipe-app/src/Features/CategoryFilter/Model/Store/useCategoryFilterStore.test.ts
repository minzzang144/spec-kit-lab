import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useCategoryFilterStore } from './useCategoryFilterStore';

describe('useCategoryFilterStore', () => {
	beforeEach(() => {
		act(() => {
			useCategoryFilterStore.setState({ selectedCategoryId: null });
		});
	});

	it('should initialize with null selectedCategoryId', () => {
		const { result } = renderHook(() => useCategoryFilterStore());
		expect(result.current.selectedCategoryId).toBeNull();
	});

	it('should set selectedCategoryId', () => {
		const { result } = renderHook(() => useCategoryFilterStore());

		act(() => {
			result.current.setSelectedCategoryId('cat-breakfast');
		});

		expect(result.current.selectedCategoryId).toBe('cat-breakfast');
	});

	it('should reset to null when setting null', () => {
		const { result } = renderHook(() => useCategoryFilterStore());

		act(() => {
			result.current.setSelectedCategoryId('cat-lunch');
		});
		expect(result.current.selectedCategoryId).toBe('cat-lunch');

		act(() => {
			result.current.setSelectedCategoryId(null);
		});
		expect(result.current.selectedCategoryId).toBeNull();
	});

	it('should update when switching categories', () => {
		const { result } = renderHook(() => useCategoryFilterStore());

		act(() => {
			result.current.setSelectedCategoryId('cat-breakfast');
		});
		expect(result.current.selectedCategoryId).toBe('cat-breakfast');

		act(() => {
			result.current.setSelectedCategoryId('cat-dinner');
		});
		expect(result.current.selectedCategoryId).toBe('cat-dinner');
	});
});
