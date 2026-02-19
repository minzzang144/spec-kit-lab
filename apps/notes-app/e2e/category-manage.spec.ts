import { test, expect } from '@playwright/test';

test.describe('US6: 카테고리 관리', () => {
  test('E2E-US6-001: 카테고리 생성 후 목록에 표시된다', async ({ page }) => {
    await page.goto('/categories');

    await page.getByLabel('새 카테고리 이름').fill('독서');
    await page.getByRole('button', { name: '추가' }).click();

    // main 영역의 목록에서 확인 (sidebar 중복 방지)
    await expect(page.locator('main').getByText('독서').first()).toBeVisible();
  });

  test('E2E-US6-002: 기본 카테고리는 삭제 버튼이 없다', async ({ page }) => {
    await page.goto('/categories');

    const uncategorizedRow = page.locator('li').filter({ hasText: '미분류' });
    await expect(uncategorizedRow).toBeVisible();
    await expect(uncategorizedRow.getByRole('button', { name: '삭제' })).not.toBeVisible();
  });

  test('E2E-US6-003: 카테고리 삭제 시 확인 Dialog가 표시된다', async ({ page }) => {
    await page.goto('/categories');

    await page.getByLabel('새 카테고리 이름').fill('삭제테스트카테고리');
    await page.getByRole('button', { name: '추가' }).click();
    await expect(page.locator('main').getByText('삭제테스트카테고리').first()).toBeVisible();

    const categoryRow = page.locator('li').filter({ hasText: '삭제테스트카테고리' });
    await categoryRow.getByRole('button', { name: '삭제' }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('카테고리 삭제')).toBeVisible();
  });

  test('E2E-US6-004: Enter 키로 카테고리 추가', async ({ page }) => {
    await page.goto('/categories');

    const input = page.getByLabel('새 카테고리 이름');
    await input.fill('Enter키테스트');
    await input.press('Enter');

    await expect(page.locator('main').getByText('Enter키테스트').first()).toBeVisible();
  });

  test('E2E-US6-005: 빈 이름으로 추가 시 에러 표시', async ({ page }) => {
    await page.goto('/categories');

    await page.getByRole('button', { name: '추가' }).click();

    await expect(page.getByRole('alert')).toBeVisible();
  });
});
