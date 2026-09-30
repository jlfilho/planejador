import { expect, test } from '@playwright/test';

const plan = { id: 'plan', ownerId: 'teacher-id', owner: { id: 'teacher-id', email: 'professor@uea.edu.br' }, status: 'RASCUNHO', markdown: '# Plano', aiAssisted: true, references: [], aiRun: { skills: [{ habilidade: { id: 'skill', codigo: 'EF01CO01', descricao: 'Algoritmos' } }] } };

test('somente ADMIN acessa a área dedicada e vê o proprietário do plano', async ({ page }) => {
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/auth/refresh')) return route.fulfill({ json: { accessToken: 'token' } });
    if (path.endsWith('/auth/me')) return route.fulfill({ json: { id: 'admin-id', email: 'admin@uea.edu.br', role: 'ADMIN', active: true } });
    if (path.endsWith('/plans')) return route.fulfill({ json: [plan] });
    await route.fallback();
  });
  await page.goto('/admin/planos');
  await expect(page.getByRole('heading', { name: 'Planos privados' })).toBeVisible();
  await page.getByRole('button', { name: /professor@uea\.edu\.br/ }).click();
  await expect(page.getByText('Professor proprietário: professor@uea.edu.br')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Finalizar plano' })).toHaveCount(0);
});

test('PROFESSOR não acessa a área administrativa', async ({ page }) => {
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/auth/refresh')) return route.fulfill({ json: { accessToken: 'token' } });
    if (path.endsWith('/auth/me')) return route.fulfill({ json: { id: 'teacher-id', email: 'teacher@uea.edu.br', role: 'PROFESSOR', active: true } });
    await route.fallback();
  });
  await page.goto('/admin/planos');
  await expect(page.getByRole('heading', { name: 'Acesso ADMIN necessário.' })).toBeVisible();
});
