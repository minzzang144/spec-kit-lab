import { test, expect } from '@playwright/test';

test.describe('US1: 노트 작성', () => {
  test('E2E-US1-001: 제목/내용/카테고리로 노트를 생성하고 목록에서 확인', async ({ page }) => {
    await page.goto('/notes/new');

    await page.getByLabel('제목').fill('E2E 테스트 노트');
    await page.getByLabel('내용').fill('E2E 테스트 내용입니다');

    await page.getByRole('button', { name: '작성' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByText('E2E 테스트 노트')).toBeVisible();
  });

  test('E2E-US1-002: 제목 없이 저장 시도 시 검증 오류 표시', async ({ page }) => {
    await page.goto('/notes/new');

    await page.getByRole('button', { name: '작성' }).click();

    await expect(page.getByText('제목을 입력해주세요')).toBeVisible();
  });
});
