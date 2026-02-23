import { test, expect } from '@playwright/test';

test.describe('US5: 노트 삭제', () => {
  test('E2E-US5-001: 삭제 확인 시 노트가 목록에서 제거된다', async ({ page }) => {
    await page.goto('/');

    const firstCard = page.locator('article[role="article"]').first();
    const deletedTitle = await firstCard.locator('h3').textContent();
    await firstCard.click();

    await expect(page).toHaveURL(/\/notes\/\d+/);

    await page.getByRole('button', { name: '삭제' }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('이 노트를 삭제하시겠습니까?')).toBeVisible();

    await page.getByRole('button', { name: '삭제' }).last().click();

    await expect(page).toHaveURL('/');
    await expect(page.getByText(deletedTitle ?? '')).not.toBeVisible();
  });

  test('E2E-US5-002: 삭제 취소 시 노트가 보존된다', async ({ page }) => {
    await page.goto('/');

    const firstCard = page.locator('article[role="article"]').first();
    const noteTitle = await firstCard.locator('h3').textContent();
    await firstCard.click();

    await page.getByRole('button', { name: '삭제' }).click();

    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByRole('button', { name: '취소' }).click();

    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByRole('heading', { name: noteTitle ?? '' })).toBeVisible();
  });
});
