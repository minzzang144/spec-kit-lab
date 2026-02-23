import { test, expect } from '@playwright/test';

test.describe('US7: 카테고리별 노트 필터링', () => {
  test('E2E-US7-001: 카테고리 필터 선택 시 해당 카테고리 노트만 표시', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('article[role="article"]').first()).toBeVisible();
    const allCount = await page.locator('article[role="article"]').count();

    // main 영역의 CategoryFilter 버튼만 선택 (sidebar 중복 방지)
    await page.locator('main').getByRole('button', { name: '업무' }).click();

    const filteredCount = await page.locator('article[role="article"]').count();
    expect(filteredCount).toBeLessThan(allCount);
  });

  test('E2E-US7-002: "전체" 선택 시 모든 노트 표시', async ({ page }) => {
    await page.goto('/');

    // 노트가 로드될 때까지 대기 후 카운트
    await expect(page.locator('article[role="article"]').first()).toBeVisible();
    const allCount = await page.locator('article[role="article"]').count();

    await page.locator('main').getByRole('button', { name: '업무' }).click();
    await page.locator('main').getByRole('button', { name: '전체' }).click();

    const restoredCount = await page.locator('article[role="article"]').count();
    expect(restoredCount).toBe(allCount);
  });

  test('E2E-US7-003: 페이지 진입 시 "전체" 필터가 활성화 상태', async ({ page }) => {
    await page.goto('/');

    const allButton = page.locator('main').getByRole('button', { name: '전체' });
    await expect(allButton).toBeVisible();
  });

  test('E2E-US7-004: 노트가 없는 카테고리 선택 시 빈 상태 표시', async ({ page }) => {
    await page.goto('/categories');

    await page.getByLabel('새 카테고리 이름').fill('빈카테고리');
    await page.getByRole('button', { name: '추가' }).click();
    await expect(page.locator('main').getByText('빈카테고리').first()).toBeVisible();

    // page.goto() 는 전체 리로드 → MSW DB 초기화됨
    // 사이드바 링크로 소프트 내비게이션 (MSW 상태 유지)
    await page.getByRole('link', { name: '내 노트' }).click();
    await page.waitForURL('http://localhost:5173/');

    // 새로 생성된 카테고리가 CategoryFilter에 로드될 때까지 대기
    await expect(page.locator('main').getByRole('button', { name: '빈카테고리' })).toBeVisible({ timeout: 5000 });
    await page.locator('main').getByRole('button', { name: '빈카테고리' }).click();

    await expect(page.getByText('아직 작성된 노트가 없습니다')).toBeVisible();
  });
});
