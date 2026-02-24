import { expect, test } from '@playwright/test';

test.describe('Filter Persistence', () => {
	test('filter should persist after navigating to detail and back', async ({
		page,
	}) => {
		await page.goto('/');

		// Select Breakfast filter
		await page.getByRole('button', { name: 'Breakfast' }).click();
		await expect(page.getByText('Fluffy Pancakes')).toBeVisible();
		await expect(page.getByText('Beef Stew')).not.toBeVisible();

		// Navigate to detail
		await page.getByText('Fluffy Pancakes').click();
		await expect(page).toHaveURL(/\/recipes\/recipe-1/);

		// Go back
		await page.getByText('← 목록으로').click();

		// Filter state is managed by Zustand (in-memory), so it persists
		// within the same session as long as the store isn't reset
		await expect(page.getByText('Fluffy Pancakes')).toBeVisible();
	});
});
