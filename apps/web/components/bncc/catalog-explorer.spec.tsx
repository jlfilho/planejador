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
    render(<CatalogExplorer />);
    const level = await screen.findByLabelText('Nível');
    fireEvent.change(level, { target: { value: 'ei' } });
    expect(screen.queryByLabelText('Ano')).toBeNull();
    expect(await screen.findByText('Nenhuma habilidade encontrada.')).toBeTruthy();
  });
});
