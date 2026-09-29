import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CatalogExplorer } from './catalog-explorer';

const mocked = vi.hoisted(() => ({ setToken: vi.fn(), skills: vi.fn() }));
vi.mock('../../lib/bncc-api', () => ({ catalogApi: { levels: vi.fn(async () => [{ id: 'ei', codigo: 'EDUCACAO_INFANTIL', nome: 'Educação Infantil', ativo: true }]), stages: vi.fn(async () => [{ id: 'stage', codigo: 'EI', nome: 'EI', anoInicial: null, anoFinal: null, ativo: true }]), skills: mocked.skills.mockResolvedValue({ data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } }) } }));
vi.mock('../auth/auth-session-provider', () => ({ useSession: () => ({ accessToken: 'token', ready: true, setToken: mocked.setToken }) }));

describe('CatalogExplorer', () => {
  afterEach(cleanup);
  it('oculta ano na Educação Infantil e distingue resultado vazio', async () => {
    mocked.skills.mockResolvedValue({ data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } });
    render(<CatalogExplorer />);
    const level = await screen.findByLabelText('Nível');
    fireEvent.change(level, { target: { value: 'ei' } });
    expect(screen.queryByLabelText('Ano')).toBeNull();
    expect(await screen.findByText('Nenhuma habilidade encontrada.')).toBeTruthy();
  });

  it('mostra detalhe local e paginação sem trocar dados por conteúdo demonstrativo', async () => {
    mocked.skills.mockResolvedValue({ data: [{ id: 'skill', codigo: 'EF01CO01', eixo: 'MUNDO_DIGITAL', descricao: 'Descrição real', explicacao: 'Explicação real', ativa: true, exemplos: [{ texto: 'Exemplo real' }], etapa: {} }], meta: { page: 1, pageSize: 1, total: 2, totalPages: 2 } });
    render(<CatalogExplorer />);
    expect(await screen.findByText('EF01CO01 — Descrição real')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Ver detalhes' }));
    expect(screen.getByRole('dialog', { name: 'Detalhe da habilidade EF01CO01' }).textContent).toContain('Exemplo real');
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Próxima' }));
    expect(await screen.findByText('Página 2 de 2')).toBeTruthy();
  });

  it('comunica carregamento e erro de filtros sem expor detalhes internos', async () => {
    mocked.skills.mockRejectedValueOnce(new Error('internal api error'));
    render(<CatalogExplorer />);
    expect((await screen.findByRole('alert')).textContent).toContain('Confira os filtros e tente novamente.');
  });

  it('informa carregamento enquanto a consulta está pendente', async () => {
    mocked.skills.mockReturnValueOnce(new Promise(() => undefined));
    render(<CatalogExplorer />);
    expect(await screen.findByText('Buscando no catálogo…')).toBeTruthy();
  });
});
