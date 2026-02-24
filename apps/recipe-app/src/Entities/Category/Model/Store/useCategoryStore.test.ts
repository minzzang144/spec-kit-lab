import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useCategoryStore } from './useCategoryStore';

describe('useCategoryStore', () => {
	it('should initialize with null selectedCategoryId', () => {
		const { result } = renderHook(() => useCategoryStore());
		expect(result.current.selectedCategoryId).toBeNull();
	});
});
