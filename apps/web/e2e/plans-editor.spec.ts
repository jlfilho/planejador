import { expect, test } from '@playwright/test';

const plan = { id: 'plan', ownerId: 'owner', status: 'RASCUNHO', markdown: '# Original', aiAssisted: true, references: [{ title: 'BNCC' }], aiRun: { skills: [{ habilidade: { id: 'skill', codigo: 'EF01CO01', descricao: 'Algoritmos' } }] } };

test('professor salva e finaliza explicitamente, deixando o conteúdo somente leitura', async ({ page }) => {
  let current = structuredClone(plan); await page.route('**/api/v1/**', async route => { const path = new URL(route.request().url()).pathname; if (path.endsWith('/auth/refresh')) return route.fulfill({ json: { accessToken: 'token' } }); if (path.endsWith('/bncc/skills')) return route.fulfill({ json: { data: [], meta: { page: 1, pageSize: 100, total: 0, totalPages: 0 } } }); if (path.endsWith('/plans') && route.request().method() === 'GET') return route.fulfill({ json: [current] }); await route.fallback(); });
  await page.route('**/api/v1/plans/plan', async route => { if (route.request().method() !== 'PATCH') return route.fallback(); current = { ...current, ...(route.request().postDataJSON()) }; await route.fulfill({ json: current }); });
  await page.route('**/api/v1/plans/plan/finalize', async route => { if (route.request().method() !== 'POST') return route.fallback(); current = { ...current, status: 'FINALIZADO' }; await route.fulfill({ json: current }); });
  await page.goto('/planos'); await page.getByRole('button', { name: 'Abrir' }).click(); await page.getByLabel('Markdown').fill('# Revisado'); await page.getByRole('button', { name: 'Salvar rascunho' }).click(); await expect(page.getByText('Rascunho salvo.')).toBeVisible(); page.on('dialog', dialog => dialog.accept()); await page.getByRole('button', { name: 'Finalizar plano' }).click(); await expect(page.getByLabel('Markdown')).toBeDisabled(); await expect(page.getByRole('button', { name: 'Salvar rascunho' })).toHaveCount(0);
});
