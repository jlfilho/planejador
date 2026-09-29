import { expect, test } from '@playwright/test';

for (const viewport of [{ name: 'desktop', width: 1440, height: 900 }, { name: 'mobile', width: 390, height: 844 }]) {
  test.describe(`alinhamento visual em ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test('preserva a mensagem genérica de erro de autenticação', async ({ page }) => {
      await page.route('**/api/v1/auth/login', route => route.fulfill({ status: 401, json: { message: 'Invalid credentials' } }));
      await page.goto('/');
      await page.getByLabel('E-mail').fill('professor@escola.edu.br');
      await page.getByLabel('Senha').fill('senha-incorreta');
      await page.getByRole('button', { name: 'Entrar com segurança' }).click();
      await expect(page.getByText('Não foi possível autenticar. Confira os dados e tente novamente.')).toBeVisible();
      await expect(page.getByRole('tablist')).toBeVisible();
    });

    test('apresenta o estado vazio do catálogo mantendo filtros utilizáveis', async ({ page }) => {
      await page.route('**/api/v1/**', async route => {
        const path = new URL(route.request().url()).pathname;
        if (path.endsWith('/auth/refresh')) return route.fulfill({ json: { accessToken: 'token' } });
        if (path.endsWith('/bncc/levels')) return route.fulfill({ json: [{ id: 'level', codigo: 'EDUCACAO_INFANTIL', nome: 'Educação Infantil', ativo: true }] });
        if (path.endsWith('/stages')) return route.fulfill({ json: [] });
        if (path.endsWith('/bncc/skills')) return route.fulfill({ json: { data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } } });
        await route.fallback();
      });
      await page.goto('/catalogo-bncc');
      await expect(page.getByText('Nenhuma habilidade encontrada.')).toBeVisible();
      await page.getByRole('button', { name: 'Limpar filtros' }).click();
      await expect(page.getByLabel('Busca')).toBeVisible();
    });
  });
}
