import { expect, test } from '@playwright/test';

test.describe('Filter Persistence', () => {
	test('filter should persist after navigating to detail and back', async ({
		page,
	}) => {
		await page.goto('/');

		await page.getByRole('button', { name: 'Breakfast' }).click();
		await expect(page.getByRole('link', { name: /Fluffy Pancakes/ })).toBeVisible();
		await expect(page.getByRole('link', { name: /Beef Stew/ })).not.toBeVisible();

		await page.getByRole('link', { name: /Fluffy Pancakes/ }).click();
		await expect(page).toHaveURL(/\/recipes\/recipe-1/);

		await page.getByText('← 목록으로').click();
		await expect(page.getByRole('link', { name: /Fluffy Pancakes/ })).toBeVisible();
	});
});
