import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useCategoryStore } from '#/Entities/Category';

import { useCategoryFilterLogic } from './useCategoryFilterLogic';

describe('useCategoryFilterLogic', () => {
	beforeEach(() => {
		act(() => {
			useCategoryStore.setState({ selectedCategoryId: null });
		});
	});

	it('should set selectedCategoryId via setState', () => {
		const { result } = renderHook(() => useCategoryFilterLogic());

		act(() => {
			result.current.setSelectedCategoryId('cat-breakfast');
		});

		expect(useCategoryStore.getState().selectedCategoryId).toBe(
			'cat-breakfast',
		);
	});

	it('should reset to null', () => {
		act(() => {
			useCategoryStore.setState({ selectedCategoryId: 'cat-lunch' });
		});

		const { result } = renderHook(() => useCategoryFilterLogic());

		act(() => {
			result.current.setSelectedCategoryId(null);
		});

		expect(useCategoryStore.getState().selectedCategoryId).toBeNull();
	});

	it('should switch between categories', () => {
		const { result } = renderHook(() => useCategoryFilterLogic());

		act(() => {
			result.current.setSelectedCategoryId('cat-breakfast');
		});
		expect(useCategoryStore.getState().selectedCategoryId).toBe(
			'cat-breakfast',
		);

		act(() => {
			result.current.setSelectedCategoryId('cat-dinner');
		});
		expect(useCategoryStore.getState().selectedCategoryId).toBe(
			'cat-dinner',
		);
	});
});
