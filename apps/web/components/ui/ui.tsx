import React, { type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';

export function Button({ className = '', variant = 'primary', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' }) {
  return <button className={`button ${variant} ${className}`.trim()} {...props} />;
}

export function Panel({ children, className = '', ...props }: HTMLAttributes<HTMLElement> & { children: ReactNode }) {
  return <section className={`panel panel-pad ${className}`.trim()} {...props}>{children}</section>;
}

export function Notice({ children, tone = 'info', status = false }: { children: ReactNode; tone?: 'info' | 'error' | 'success'; status?: boolean }) {
  return <p className={`notice ${tone}`} role={status ? 'status' : tone === 'error' ? 'alert' : undefined}>{children}</p>;
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return <div className="panel empty-state"><span aria-hidden="true">⌕</span><strong>{title}</strong>{children && <span>{children}</span>}</div>;
}

export function Dialog({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}><section className="dialog panel panel-pad" role="dialog" aria-modal="true" aria-label={title} onMouseDown={event => event.stopPropagation()}><div className="page-header"><div><span className="eyebrow">Catálogo BNCC</span><h2>{title}</h2></div><Button variant="ghost" className="small" onClick={onClose} aria-label="Fechar">Fechar</Button></div>{children}</section></div>;
}
