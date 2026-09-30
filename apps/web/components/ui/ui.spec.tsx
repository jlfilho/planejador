import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button, Dialog, EmptyState, Notice, Panel } from './ui';

describe('componentes de apresentação', () => {
  it('expõe semântica de alerta, status e diálogo', () => {
    const close = vi.fn();
    render(<><Panel>Conteúdo</Panel><Button>Continuar</Button><Notice tone="error">Erro</Notice><Notice status>Pronto</Notice><EmptyState title="Sem dados" /><Dialog title="Detalhe" onClose={close}>Conteúdo</Dialog></>);
    expect(screen.getByRole('alert').textContent).toContain('Erro');
    expect(screen.getByRole('status').textContent).toContain('Pronto');
    expect(screen.getByRole('dialog', { name: 'Detalhe' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(close).toHaveBeenCalledOnce();
  });
});
