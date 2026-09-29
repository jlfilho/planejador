import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CatalogAdmin } from './catalog-admin';

const mocked = vi.hoisted(() => ({ setToken: vi.fn(), apiRequest: vi.fn(), session: { accessToken: 'token' as string | undefined, ready: true } }));
vi.mock('../../lib/api-client', () => ({ apiRequest: mocked.apiRequest.mockImplementation(async (path: string) => {
  if (path === '/admin/bncc/levels') return [{ id: 'level', codigo: 'ENSINO_FUNDAMENTAL', nome: 'Ensino Fundamental', ativo: true }];
  if (path.includes('/stages')) return [{ id: 'stage', codigo: 'EF01', nome: '1º ano', anoInicial: 1, anoFinal: 1, ativo: true }];
  return { data: [{ id: 'skill', codigo: 'EF01CO01', eixo: 'MUNDO_DIGITAL', descricao: 'Descrição', explicacao: 'Explicação', ativa: true, exemplos: [{ texto: 'Exemplo' }], etapa: {} }], meta: { page: 1, pageSize: 100, total: 1, totalPages: 1 } };
}) }));
vi.mock('../auth/auth-session-provider', () => ({ useSession: () => ({ ...mocked.session, setToken: mocked.setToken }) }));

describe('CatalogAdmin', () => {
  afterEach(() => { cleanup(); mocked.session.accessToken = 'token'; vi.clearAllMocks(); });
  it('mostra níveis, inativos e controles de curadoria para sessão ADMIN autorizada pelo backend', async () => {
    render(<CatalogAdmin />);
    expect(await screen.findByText('Ensino Fundamental')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Criar nível' })).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'Desativar' })).toHaveLength(3);
  });

  it('edita uma habilidade por diálogo acessível e mantém a mutação na API', async () => {
    render(<CatalogAdmin />);
    expect(await screen.findByText('EF01CO01')).toBeTruthy();
    fireEvent.click(screen.getAllByRole('button', { name: 'Editar' })[2]);
    const dialog = screen.getByRole('dialog', { name: 'Editar habilidade' });
    fireEvent.change(within(dialog).getByLabelText('Descrição'), { target: { value: 'Descrição atualizada' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Salvar alterações' }));
    await waitFor(() => expect(mocked.apiRequest).toHaveBeenCalledWith('/admin/bncc/skills/skill', 'token', mocked.setToken, expect.objectContaining({ method: 'PATCH' })));
    expect(dialog).toBeTruthy();
  });

  it('cria nível e informa acesso administrativo ausente sem conceder privilégios no cliente', async () => {
    render(<CatalogAdmin />);
    const form = screen.getByRole('button', { name: 'Criar nível' }).closest('form')!;
    fireEvent.change(within(form).getByLabelText('Código'), { target: { value: 'ENSINO_MEDIO' } });
    fireEvent.change(within(form).getByLabelText('Nome'), { target: { value: 'Ensino Médio' } });
    fireEvent.submit(form);
    await waitFor(() => expect(mocked.apiRequest).toHaveBeenCalledWith('/admin/bncc/levels', 'token', mocked.setToken, expect.objectContaining({ method: 'POST' })));
    cleanup();
    mocked.session.accessToken = undefined;
    render(<CatalogAdmin />);
    expect(screen.getByText('Faça login como ADMIN para administrar o catálogo.')).toBeTruthy();
  });

  it('mostra carregamento e erro genérico quando a autorização ADMIN é recusada', async () => {
    mocked.apiRequest.mockReturnValueOnce(new Promise(() => undefined));
    const { unmount } = render(<CatalogAdmin />);
    expect(await screen.findByText('Carregando catálogo administrativo…')).toBeTruthy();
    unmount();
    mocked.apiRequest.mockRejectedValueOnce(new Error('forbidden'));
    render(<CatalogAdmin />);
    expect((await screen.findByRole('alert')).textContent).toContain('Acesso ADMIN necessário ou catálogo indisponível.');
  });
});
