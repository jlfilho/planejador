'use client';

import React, { useState } from 'react';
import { useSession } from '../components/auth/auth-session-provider';
import { Button, Notice, Panel } from '../components/ui/ui';
import { authRequest, refreshSession } from '../lib/auth';

type Mode = 'login' | 'register';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [mode, setMode] = useState<Mode>('login');
  const [submitting, setSubmitting] = useState(false);
  const session = useSession();

  async function submit() {
    try {
      setSubmitting(true); setMessage('');
      const result = await authRequest(mode === 'login' ? '/auth/login' : '/auth/register', { email, password });
      session.setToken(result.accessToken); setIsError(false);
      setMessage(mode === 'login' ? 'Sessão iniciada.' : 'Conta criada e sessão iniciada.');
    } catch {
      setIsError(true); setMessage('Não foi possível autenticar. Confira os dados e tente novamente.');
    } finally { setSubmitting(false); }
  }

  async function renew() {
    try { const result = await refreshSession(); session.setToken(result.accessToken); setIsError(false); setMessage('Sessão renovada.'); }
    catch { setIsError(true); setMessage('Nova autenticação necessária.'); }
  }

  async function signOut() { await session.signOut(); setIsError(false); setMessage('Sessão encerrada.'); }

  return <main className="auth-layout">
    <aside className="auth-copy">
      <div>
        <a className="brand" href="/"><span className="brand-mark"><img src="/figma/auth-book-open-check.svg" alt="" /></span><span>Planejador BNCC</span></a>
        <p className="eyebrow">Planejamento pedagógico</p>
        <h1>Planeje com clareza. Ensine com propósito.</h1>
        <p>Organize habilidades da BNCC e mantenha seu planejamento sob seu controle.</p>
        <div className="auth-points">
          <div className="auth-point"><span className="auth-point-icon"><img src="/figma/auth-check.svg" alt="" /></span><span>Catálogo BNCC confiável e pesquisável.</span></div>
          <div className="auth-point"><span className="auth-point-icon"><img src="/figma/auth-check.svg" alt="" /></span><span>Sessões seguras e dados protegidos.</span></div>
          <div className="auth-point"><span className="auth-point-icon"><img src="/figma/auth-check.svg" alt="" /></span><span>Você mantém a autoria do planejamento.</span></div>
        </div>
      </div>
      <small>Planejador BNCC · Ambiente educacional seguro</small>
    </aside>
    <section className="auth-content">
      <Panel aria-labelledby="auth-title">
        <span className="eyebrow">Acesso à plataforma</span>
        <h2 id="auth-title">{mode === 'login' ? 'Boas-vindas de volta' : 'Crie sua conta de professor'}</h2>
        <p style={{ color: 'var(--muted)', lineHeight: 1.5 }}>{mode === 'login' ? 'Entre para continuar seu planejamento.' : 'Use um e-mail válido e uma senha segura.'}</p>
        <Notice tone="info" status><img className="notice-icon" src="/figma/auth-info.svg" alt="" />Nunca solicitaremos sua senha por e-mail ou mensagem.</Notice>
        <div className="auth-tabs" role="tablist" aria-label="Tipo de acesso">
          <button type="button" role="tab" aria-selected={mode === 'login'} onClick={() => { setMode('login'); setMessage(''); }}>Entrar</button>
          <button type="button" role="tab" aria-selected={mode === 'register'} onClick={() => { setMode('register'); setMessage(''); }}>Criar conta</button>
        </div>
        <form className="grid" style={{ marginTop: 22 }} onSubmit={event => { event.preventDefault(); void submit(); }}>
          <label className="field">E-mail<span className="field-control"><img src="/figma/auth-mail.svg" alt="" /><input aria-label="E-mail" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required /></span></label>
          <label className="field">Senha<span className="field-control"><img src="/figma/auth-lock-keyhole.svg" alt="" /><input aria-label="Senha" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={event => setPassword(event.target.value)} required /></span></label>
          {message && <Notice tone={isError ? 'error' : 'success'} status={!isError}>{message}</Notice>}
          <Button type="submit" disabled={submitting}>{submitting ? 'Aguarde…' : <><img className="button-icon" src="/figma/auth-log-in.svg" alt="" />{mode === 'login' ? 'Entrar com segurança' : 'Criar conta de professor'}</>}</Button>
        </form>
        <section className="session-card" aria-labelledby="session-title">
          <h2 id="session-title">Segurança da sessão</h2><p>Renove a sessão quando necessário ou encerre o acesso neste dispositivo.</p>
          <div className="button-row"><Button type="button" variant="secondary" onClick={() => void renew()}>Renovar sessão</Button><Button type="button" variant="ghost" onClick={() => void signOut()}>Sair</Button></div>
        </section>
      </Panel>
    </section>
  </main>;
}
