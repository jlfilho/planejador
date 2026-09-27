import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/v1/**', async route => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/auth/refresh')) return route.fulfill({ json: { accessToken: 'token' } });
    if (path.endsWith('/bncc/levels')) return route.fulfill({ json: [{ id: 'level', codigo: 'EDUCACAO_INFANTIL', nome: 'Educação Infantil', ativo: true }] });
    if (path.endsWith('/stages')) return route.fulfill({ json: [{ id: 'stage', codigo: 'EI', nome: 'Educação Infantil', anoInicial: null, anoFinal: null, ativo: true }] });
    if (path.endsWith('/bncc/skills')) return route.fulfill({ json: { data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } } });
    await route.fallback();
  });
});

test('professor explora filtros, não vê ano na EI e recebe estado vazio', async ({ page }) => {
  await page.goto('/catalogo-bncc');
  await page.getByLabel('Nível').selectOption('level');
  await expect(page.getByLabel('Ano')).toHaveCount(0);
  await expect(page.getByText('Nenhuma habilidade encontrada.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Anterior' })).toBeDisabled();
});
