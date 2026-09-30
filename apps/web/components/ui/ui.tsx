import { ButtonHTMLAttributes, HTMLAttributes, PropsWithChildren } from 'react';

export function Button({ variant, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'secondary' | 'ghost' }) {
  return <button className={`button ${variant ? `button-${variant}` : ''} ${className}`.trim()} {...props} />;
}

export function Panel({ children, className = '', ...props }: PropsWithChildren<HTMLAttributes<HTMLElement>>) {
  return <section className={`panel ${className}`.trim()} {...props}>{children}</section>;
}

export function Notice({ children, tone = 'info' }: PropsWithChildren<{ tone?: 'info' | 'success' | 'error' | 'warning' }>) {
  return <p role={tone === 'error' ? 'alert' : 'status'} className={`notice notice-${tone}`}>{children}</p>;
}

export function EmptyState({ title, children }: PropsWithChildren<{ title: string }>) {
  return <section className="empty-state"><h2>{title}</h2>{children && <p>{children}</p>}</section>;
}
