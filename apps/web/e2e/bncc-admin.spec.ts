import { expect, test } from '@playwright/test';

test('admin desativa habilidade e a consulta docente deixa de exibi-la', async ({ page }) => {
  let active = true;
  await page.route('**/api/v1/**', async route => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/auth/refresh')) return route.fulfill({ json: { accessToken: 'token' } });
    if (path.endsWith('/admin/bncc/levels')) return route.fulfill({ json: [{ id: 'level', codigo: 'ENSINO_FUNDAMENTAL', nome: 'Ensino Fundamental', ativo: true }] });
    if (path.endsWith('/admin/bncc/levels/level/stages')) return route.fulfill({ json: [{ id: 'stage', codigo: 'EF01', nome: '1º ano', anoInicial: 1, anoFinal: 1, ativo: true }] });
    if (path.endsWith('/admin/bncc/skills') && route.request().method() === 'GET') return route.fulfill({ json: { data: [{ id: 'skill', codigo: 'EF01CO01', eixo: 'MUNDO_DIGITAL', descricao: 'Descrição', explicacao: 'Explicação', ativa: active, exemplos: [{ texto: 'Exemplo' }], etapa: {} }], meta: { page: 1, pageSize: 100, total: 1, totalPages: 1 } } });
    if (path.endsWith('/admin/bncc/skills/skill') && route.request().method() === 'PATCH') { active = false; return route.fulfill({ json: {} }); }
    if (path.endsWith('/bncc/levels')) return route.fulfill({ json: [] });
    if (path.endsWith('/bncc/skills')) return route.fulfill({ json: { data: active ? [{ id: 'skill', codigo: 'EF01CO01', descricao: 'Descrição', explicacao: 'Explicação', exemplos: [] }] : [], meta: { page: 1, pageSize: 20, total: active ? 1 : 0, totalPages: active ? 1 : 0 } } });
    await route.fallback();
  });
  await page.goto('/catalogo-bncc/admin');
  await page.getByRole('button', { name: 'Desativar' }).last().click();
  await expect(page.getByRole('status')).toHaveText('Alteração salva e auditada.');
  await page.goto('/catalogo-bncc');
  await expect(page.getByText('Nenhuma habilidade encontrada.')).toBeVisible();
});
