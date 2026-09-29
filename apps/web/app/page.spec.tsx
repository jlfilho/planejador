import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Home from './page';

const mocked = vi.hoisted(() => ({ authRequest: vi.fn(), refreshSession: vi.fn(), signOut: vi.fn(), setToken: vi.fn() }));
vi.mock('../lib/auth', () => ({ authRequest: mocked.authRequest, refreshSession: mocked.refreshSession }));
vi.mock('../components/auth/auth-session-provider', () => ({ useSession: () => ({ setToken: mocked.setToken, signOut: mocked.signOut }) }));

describe('tela de autenticação', () => {
  afterEach(() => { cleanup(); vi.clearAllMocks(); });
  it('envia login e apresenta mensagem genérica quando falha', async () => {
    mocked.authRequest.mockRejectedValueOnce(new Error('denied'));
    render(<Home />);
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'professor@escola.edu.br' } });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'senha-segura' } });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar com segurança' }));
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Não foi possível autenticar. Confira os dados e tente novamente.'));
    expect(mocked.authRequest).toHaveBeenCalledWith('/auth/login', { email: 'professor@escola.edu.br', password: 'senha-segura' });
  });

  it('preserva registro, renovação e encerramento da sessão', async () => {
    mocked.authRequest.mockResolvedValueOnce({ accessToken: 'created' });
    mocked.refreshSession.mockResolvedValueOnce({ accessToken: 'renewed' });
    render(<Home />);
    fireEvent.click(screen.getByRole('tab', { name: 'Criar conta' }));
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'novo@escola.edu.br' } });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'senha-segura' } });
    fireEvent.click(screen.getByRole('button', { name: 'Criar conta de professor' }));
    await waitFor(() => expect(mocked.setToken).toHaveBeenCalledWith('created'));
    fireEvent.click(screen.getByRole('button', { name: 'Renovar sessão' }));
    await waitFor(() => expect(mocked.setToken).toHaveBeenCalledWith('renewed'));
    fireEvent.click(screen.getByRole('button', { name: 'Sair' }));
    expect(mocked.signOut).toHaveBeenCalledOnce();
  });

  it('informa nova autenticação necessária quando a renovação falha', async () => {
    mocked.refreshSession.mockRejectedValueOnce(new Error('expired'));
    render(<Home />);
    fireEvent.click(screen.getByRole('button', { name: 'Renovar sessão' }));
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Nova autenticação necessária.'));
  });
});
