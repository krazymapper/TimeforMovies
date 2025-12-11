import { test, expect } from '@playwright/test';

test('home loads', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await expect(page.getByRole('heading', { name: /Trouvez où regarder/i })).toBeVisible();
  await expect(
    page.getByPlaceholder('Rechercher un film, une série, un acteur...')
  ).toBeVisible();
});

