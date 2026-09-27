import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CatalogAdmin } from './catalog-admin';

const mocked = vi.hoisted(() => ({ setToken: vi.fn() }));
vi.mock('../../lib/api-client', () => ({ apiRequest: vi.fn(async (path: string) => {
  if (path === '/admin/bncc/levels') return [{ id: 'level', codigo: 'ENSINO_FUNDAMENTAL', nome: 'Ensino Fundamental', ativo: true }];
  if (path.includes('/stages')) return [{ id: 'stage', codigo: 'EF01', nome: '1º ano', anoInicial: 1, anoFinal: 1, ativo: true }];
  return { data: [{ id: 'skill', codigo: 'EF01CO01', eixo: 'MUNDO_DIGITAL', descricao: 'Descrição', explicacao: 'Explicação', ativa: true, exemplos: [{ texto: 'Exemplo' }], etapa: {} }], meta: { page: 1, pageSize: 100, total: 1, totalPages: 1 } };
}) }));
vi.mock('../auth/auth-session-provider', () => ({ useSession: () => ({ accessToken: 'token', ready: true, setToken: mocked.setToken }) }));

describe('CatalogAdmin', () => {
  afterEach(cleanup);
  it('mostra níveis, inativos e controles de curadoria para sessão ADMIN autorizada pelo backend', async () => {
    render(<CatalogAdmin />);
    expect(await screen.findByText('Ensino Fundamental')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Criar nível' })).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'Desativar' })).toHaveLength(3);
  });
});
