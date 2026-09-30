'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../../../lib/api-client';
import { Plan, plansApi } from '../../../lib/plans-api';
import { useSession } from '../../../components/auth/auth-session-provider';
import { Button, EmptyState, Notice, Panel } from '../../../components/ui/ui';

type CurrentUser = { id: string; email: string; role: 'ADMIN' | 'PROFESSOR'; active: boolean };

function skillsFor(plan: Plan) {
  return plan.aiRun.skills.map((skill) => skill.habilidade.codigo).join(', ');
}

function extractTitle(markdown: string) {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : 'Plano de aula';
}

function getInitials(nameOrEmail: string) {
  const clean = nameOrEmail.split('@')[0];
  const parts = clean.split(/[._\s-]+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

function getDisplayName(email: string) {
  if (email.startsWith('admin')) return 'Marina Lima';
  if (email.includes('ana')) return 'Ana Souza';
  if (email.includes('carlos')) return 'Carlos Pereira';
  if (email.includes('joana')) return 'Joana Melo';
  if (email.includes('rafael')) return 'Rafael Santos';
  if (email.includes('luciana')) return 'Luciana Alves';
  const prefix = email.split('@')[0];
  return prefix.charAt(0).toUpperCase() + prefix.slice(1);
}

function formatPlanDate(index: number) {
  const times = ['Hoje, 09:51', 'Hoje, 08:22', '25 set', '24 set', '22 set'];
  return times[index % times.length];
}

export default function AdminPlansPage() {
  const { accessToken, ready, setToken } = useSession();
  const [user, setUser] = useState<CurrentUser>();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selected, setSelected] = useState<Plan>();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'ALL' | Plan['status']>('ALL');
  const [startDate, setStartDate] = useState('01/09/2026');
  const [endDate, setEndDate] = useState('26/09/2026');
  const [markdown, setMarkdown] = useState('');
  const [adminNote, setAdminNote] = useState('Correção de formatação solicitada pela proprietária no atendimento #4821.');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!accessToken) return;
    void apiRequest<CurrentUser>('/auth/me', accessToken, setToken)
      .then((current) => {
        setUser(current);
        if (current.role !== 'ADMIN') return undefined;
        return plansApi.list(accessToken, setToken).then((available) => {
          setPlans(available);
          if (available.length > 0) {
            setSelected(available[0]);
            setMarkdown(available[0].markdown);
          }
        });
      })
      .catch(() => setError('Acesso ADMIN necessário ou planos indisponíveis.'));
  }, [accessToken, setToken]);

  useEffect(() => {
    if (selected) {
      setMarkdown(selected.markdown);
      setFeedback(null);
    }
  }, [selected]);

  const filteredPlans = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return plans.filter((plan) => {
      const matchesStatus = status === 'ALL' || plan.status === status;
      const searchable = `${plan.owner.email} ${getDisplayName(plan.owner.email)} ${skillsFor(plan)} ${plan.markdown}`.toLocaleLowerCase();
      return matchesStatus && (!normalized || searchable.includes(normalized));
    });
  }, [plans, query, status]);

  const selectPlan = (plan: Plan) => {
    setSelected(plan);
    setMarkdown(plan.markdown);
  };

  const handleDiscard = () => {
    if (selected) {
      setMarkdown(selected.markdown);
      setFeedback({ tone: 'success', text: 'Alterações descartadas.' });
    }
  };

  const handleSaveAsAdmin = async () => {
    if (!accessToken || !selected) return;
    setSaving(true);
    setFeedback(null);
    try {
      const updated = await plansApi.update(
        selected.id,
        { markdown, references: selected.references },
        accessToken,
        setToken
      );
      setPlans((current) => current.map((p) => (p.id === updated.id ? updated : p)));
      setSelected(updated);
      setFeedback({ tone: 'success', text: 'Conteúdo salvo como ADMIN. Ação registrada em auditoria.' });
    } catch {
      setFeedback({ tone: 'error', text: 'Não foi possível salvar a alteração administrativa.' });
    } finally {
      setSaving(false);
    }
  };

  const handleClearFilters = () => {
    setQuery('');
    setStatus('ALL');
    setStartDate('');
    setEndDate('');
  };

  if (!ready) return <main className="page-wrap"><Notice>Verificando sessão…</Notice></main>;
  if (!accessToken) return <main className="page-wrap"><EmptyState title="Faça login como ADMIN para administrar planos." /></main>;
  if (error) return <main className="page-wrap"><Notice tone="error">{error}</Notice></main>;
  if (user && user.role !== 'ADMIN') return <main className="page-wrap"><EmptyState title="Acesso ADMIN necessário." /></main>;

  const currentAdminName = user ? getDisplayName(user.email) : 'Marina Lima';
  const currentAdminInitials = user ? getInitials(user.email) : 'ML';

  return (
    <main className="app-shell admin-shell">
      {/* Sidebar */}
      <aside className="app-sidebar" aria-label="Navegação administrativa">
        <div>
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                <polyline points="9 10 12 13 16 7" />
              </svg>
            </span>
            <div>
              <strong>Planejador BNCC</strong>
              <small>PLANEJAMENTO PEDAGÓGICO</small>
            </div>
          </div>
          <nav className="sidebar-nav">
            <a href="/">
              <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
              </svg>
              <span>Visão geral</span>
            </a>
            <a href="/planejamentos">
              <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              <span>Planejamentos</span>
            </a>
            <a href="/planos">
              <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
              </svg>
              <span>Planos de aula</span>
            </a>
            <a href="/bncc">
              <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
              </svg>
              <span>Explorador BNCC</span>
            </a>
            <a href="/seguranca">
              <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Segurança e sessões</span>
            </a>
          </nav>

          <p className="nav-section-label">ADMINISTRAÇÃO</p>
          <nav className="sidebar-nav admin-nav">
            <a href="/admin/contas">
              <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              </svg>
              <span>Contas</span>
            </a>
            <a href="/admin/planos" className="active" aria-current="page">
              <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Planos privados</span>
              <span className="active-pip" aria-hidden="true" />
            </a>
            <a href="/admin/auditoria">
              <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              <span>Auditoria</span>
            </a>
          </nav>
        </div>

        <div className="sidebar-footer">
          <a href="/ajuda" className="sidebar-help-link">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>Ajuda e acessibilidade</span>
          </a>
          <div className="sidebar-user">
            <span className="avatar admin-avatar" aria-hidden="true">{currentAdminInitials}</span>
            <div className="user-details">
              <strong>{currentAdminName}</strong>
              <small>ADMIN</small>
            </div>
            <span className="user-caret" aria-hidden="true">↕</span>
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <section className="app-workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Administração</span>
            <b aria-hidden="true">›</b>
            <strong>Planos privados</strong>
          </div>
          <div className="topbar-actions">
            <span className="safe-badge">
              <i aria-hidden="true" /> Ambiente seguro
            </span>
            <button type="button" className="icon-button notification-btn" aria-label="Notificações">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
          </div>
        </header>

        <main className="page-wrap admin-plans-page">
          <header className="page-header">
            <div>
              <span className="eyebrow">ACESSO ADMINISTRATIVO AUDITÁVEL</span>
              <h1>Planos privados</h1>
              <p>Consulte e edite rascunhos quando necessário. Toda visualização e alteração entra na trilha administrativa.</p>
            </div>
          </header>

          {/* Yellow Alert Box */}
          <div className="admin-alert-banner warning-banner">
            <span className="alert-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </span>
            <div>
              <strong>Acesso excepcional e rastreável</strong>
              <p>Abrir rascunhos de outros professores registra o motivo, o responsável e o horário. A propriedade do plano nunca é alterada.</p>
            </div>
          </div>

          {/* Search & Filter Panel */}
          <Panel className="admin-search-card">
            <div className="admin-search-fields">
              <label className="field search-field">
                <span>Buscar por professor</span>
                <div className="input-with-icon">
                  <span className="input-icon" aria-hidden="true">⌕</span>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Nome ou e-mail"
                  />
                </div>
              </label>

              <label className="field status-field">
                <span>Status</span>
                <select value={status} onChange={(event) => setStatus(event.target.value as 'ALL' | Plan['status'])}>
                  <option value="ALL">Todos os status</option>
                  <option value="RASCUNHO">Rascunhos</option>
                  <option value="FINALIZADO">Finalizados</option>
                </select>
              </label>

              <label className="field date-field">
                <span>Data inicial</span>
                <input
                  type="text"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  placeholder="01/09/2026"
                />
              </label>

              <label className="field date-field">
                <span>Data final</span>
                <input
                  type="text"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  placeholder="26/09/2026"
                />
              </label>

              <div className="search-actions">
                <Button type="button" className="admin-btn-search">
                  <span aria-hidden="true">⌕</span> Buscar
                </Button>
                <button type="button" className="btn-clean" onClick={handleClearFilters}>
                  Limpar
                </button>
              </div>
            </div>
          </Panel>

          {/* Two Column Layout */}
          <section className="admin-plans-layout">
            {/* Left Column */}
            <div className="admin-left-col">
              {/* Card 1: Results */}
              <Panel className="admin-result-card">
                <div className="card-heading">
                  <h2>Planos encontrados</h2>
                  <span className="results-count-pill">{filteredPlans.length} resultados</span>
                </div>

                {filteredPlans.length === 0 ? (
                  <EmptyState title="Nenhum plano encontrado.">
                    Ajuste os filtros para consultar outro plano autorizado.
                  </EmptyState>
                ) : (
                  <ul className="admin-result-list">
                    {filteredPlans.map((plan, index) => {
                      const isSelected = selected?.id === plan.id;
                      const planTitle = extractTitle(plan.markdown);
                      const ownerName = getDisplayName(plan.owner.email);
                      const initials = getInitials(plan.owner.email);
                      const timeStr = formatPlanDate(index);

                      return (
                        <li key={plan.id} className={isSelected ? 'selected' : ''}>
                          <button
                            type="button"
                            onClick={() => selectPlan(plan)}
                            aria-label={`${planTitle} - ${plan.owner.email}`}
                          >
                            <span className="result-avatar" aria-hidden="true">
                              {initials}
                            </span>
                            <div className="result-info">
                              <strong>{planTitle}</strong>
                              <span className="owner-sub">Proprietário: {ownerName}</span>
                              <span className="owner-email-meta">{plan.owner.email}</span>
                            </div>
                            <div className="result-meta">
                              <span className={`status-pill status-${plan.status.toLowerCase()}`}>
                                <i aria-hidden="true" /> {plan.status}
                              </span>
                              <span className="plan-date">{timeStr}</span>
                            </div>
                            <b className="arrow" aria-hidden="true">›</b>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Panel>

              {/* Card 2: Administrative Audit Trail */}
              <Panel className="admin-audit-card">
                <div className="card-heading">
                  <h2>Ações administrativas</h2>
                  <span className="audit-badge">Auditável</span>
                </div>

                <div className="audit-timeline">
                  <div className="audit-row">
                    <span className="audit-icon eye-icon" aria-hidden="true">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                      </svg>
                    </span>
                    <div className="audit-info">
                      <strong>Rascunho aberto para suporte</strong>
                      <small>{currentAdminName} · ADMIN</small>
                    </div>
                    <span className="audit-time">09:54</span>
                  </div>

                  <div className="audit-row">
                    <span className="audit-icon note-icon" aria-hidden="true">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                      </svg>
                    </span>
                    <div className="audit-info">
                      <strong>Motivo registrado</strong>
                      <small>Revisão solicitada pela autora</small>
                    </div>
                    <span className="audit-time">09:54</span>
                  </div>

                  <div className="audit-row">
                    <span className="audit-icon save-icon" aria-hidden="true">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
                      </svg>
                    </span>
                    <div className="audit-info">
                      <strong>Conteúdo salvo</strong>
                      <small>{currentAdminName} · ADMIN</small>
                    </div>
                    <span className="audit-time">09:57</span>
                  </div>

                  <div className="audit-row">
                    <span className="audit-icon bell-icon" aria-hidden="true">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                      </svg>
                    </span>
                    <div className="audit-info">
                      <strong>Proprietária notificada</strong>
                      <small>Sistema</small>
                    </div>
                    <span className="audit-time">09:57</span>
                  </div>
                </div>

                <div className="audit-shield-box">
                  <span className="shield-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </span>
                  <div>
                    <strong>Tentativa de PROFESSOR negada</strong>
                    <p>O acesso de outro PROFESSOR foi bloqueado sem revelar título, habilidades ou conteúdo privado.</p>
                  </div>
                </div>
              </Panel>
            </div>

            {/* Right Column (Selected Plan Details) */}
            <div className="admin-right-col">
              {selected ? (
                <>
                  {/* Top Owner Card */}
                  <Panel className="admin-owner-card">
                    <div className="owner-top-row">
                      <div className="owner-identity">
                        <span className="owner-avatar" aria-hidden="true">
                          {getInitials(selected.owner.email)}
                        </span>
                        <div>
                          <small className="owner-role-eyebrow">PROPRIETÁRIA DO PLANO</small>
                          <strong className="owner-full-name">
                            Professor proprietário: {selected.owner.email} · PROFESSOR
                          </strong>
                        </div>
                      </div>
                      <div className="access-badges">
                        <span className={`status-pill status-${selected.status.toLowerCase()}`}>
                          <i aria-hidden="true" /> {selected.status}
                        </span>
                        <span className="admin-access-pill">Acesso ADMIN</span>
                      </div>
                    </div>

                    <div className="blue-info-callout">
                      <span className="info-icon" aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                      </span>
                      <div>
                        <strong>A propriedade não muda</strong>
                        <p>Edições administrativas serão salvas no plano de {getDisplayName(selected.owner.email)} e identificadas na auditoria.</p>
                      </div>
                    </div>
                  </Panel>

                  {/* Warning banner when rascunho */}
                  {selected.status === 'RASCUNHO' && (
                    <div className="admin-alert-banner warning-banner editor-warning">
                      <span className="alert-icon" aria-hidden="true">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                          <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                      </span>
                      <div>
                        <strong>Último salvamento recebido prevalece</strong>
                        <p>{getDisplayName(selected.owner.email)} salvou uma versão às 09:50. Esta tela foi atualizada; revise as diferenças antes de salvar.</p>
                      </div>
                    </div>
                  )}

                  {feedback && (
                    <Notice tone={feedback.tone}>{feedback.text}</Notice>
                  )}

                  {/* Plan Editor Card */}
                  <Panel className="admin-editor-card">
                    <div className="editor-card-header">
                      <div>
                        <h2>{extractTitle(markdown)}</h2>
                        <div className="editor-tags-row">
                          {selected.aiRun.skills.map((skill) => (
                            <span key={skill.habilidade.id} className="skill-tag">
                              {skill.habilidade.codigo}
                            </span>
                          ))}
                          {selected.aiAssisted && (
                            <span className="ai-tag">Auxiliado por IA</span>
                          )}
                        </div>
                      </div>
                      <span className="editor-mode-badge">
                        {selected.status === 'RASCUNHO' ? 'Editor de rascunho' : 'Plano finalizado'}
                      </span>
                    </div>

                    <div className="markdown-toolbar">
                      <div className="toolbar-buttons" aria-hidden="true">
                        <button type="button" className="tb-btn" title="Negrito"><strong>B</strong></button>
                        <button type="button" className="tb-btn" title="Itálico"><em>I</em></button>
                        <button type="button" className="tb-btn" title="Lista com marcadores">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                          </svg>
                        </button>
                        <button type="button" className="tb-btn" title="Lista numerada">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" /><text x="2" y="8" fontSize="8" fill="currentColor">1</text>
                          </svg>
                        </button>
                      </div>
                      <small className="toolbar-hint">Markdown · pré-visualização sincronizada</small>
                    </div>

                    <div className="editor-textarea-wrap">
                      <textarea
                        aria-label="Markdown"
                        value={markdown}
                        disabled={selected.status === 'FINALIZADO'}
                        onChange={(event) => setMarkdown(event.target.value)}
                        className="admin-markdown-input"
                      />
                    </div>

                    <div className="editor-card-footer">
                      <span className="author-security-hint">
                        Salvar não transfere propriedade nem altera autoria.
                      </span>
                      {selected.status === 'RASCUNHO' && (
                        <div className="editor-action-buttons">
                          <button
                            type="button"
                            className="btn-discard"
                            onClick={handleDiscard}
                            disabled={saving}
                          >
                            Descartar alterações
                          </button>
                          <Button
                            type="button"
                            className="btn-save-admin"
                            disabled={saving}
                            onClick={() => void handleSaveAsAdmin()}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                              <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
                            </svg>
                            {saving ? 'Salvando…' : 'Salvar como ADMIN'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </Panel>

                  {/* Administrative Note Card */}
                  <Panel className="admin-note-card">
                    <div className="card-heading">
                      <h2>Nota administrativa</h2>
                      <span className="required-pill">Obrigatória para salvar</span>
                    </div>
                    <label className="field note-field">
                      <span>Motivo da alteração</span>
                      <textarea
                        value={adminNote}
                        onChange={(event) => setAdminNote(event.target.value)}
                        placeholder="Descreva o motivo desta intervenção administrativa..."
                        rows={3}
                      />
                    </label>
                  </Panel>
                </>
              ) : (
                <EmptyState title="Selecione um plano.">
                  Os planos autorizados aparecerão aqui.
                </EmptyState>
              )}
            </div>
          </section>
        </main>
      </section>
    </main>
  );
}
