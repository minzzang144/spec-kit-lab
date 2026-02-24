import { expect, test } from '@playwright/test';

test.describe('US1: Recipe List with Category Filter', () => {
	test('should display recipe cards on load', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByText('레시피 북')).toBeVisible();
		await expect(page.getByRole('link', { name: /Fluffy Pancakes/ })).toBeVisible();
		await expect(page.getByRole('link', { name: /Grilled Chicken Salad/ })).toBeVisible();
	});

	test('should display category filter bar', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('group', { name: '카테고리 필터' })).toBeVisible();
		await expect(page.getByRole('button', { name: '전체' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Breakfast' })).toBeVisible();
	});

	test('should filter recipes by category', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('button', { name: 'Breakfast' }).click();
		await expect(page.getByRole('link', { name: /Fluffy Pancakes/ })).toBeVisible();
		await expect(page.getByRole('link', { name: /Beef Stew/ })).not.toBeVisible();
	});

	test('should show all recipes when "전체" is selected', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('button', { name: 'Dinner' }).click();
		await expect(page.getByRole('link', { name: /Fluffy Pancakes/ })).not.toBeVisible();

		await page.getByRole('button', { name: '전체' }).click();
		await expect(page.getByRole('link', { name: /Fluffy Pancakes/ })).toBeVisible();
		await expect(page.getByRole('link', { name: /Beef Stew/ })).toBeVisible();
	});
});
