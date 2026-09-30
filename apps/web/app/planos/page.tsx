'use client';
import { useEffect, useState } from 'react';
import { Plan, plansApi } from '../../lib/plans-api';
import { useSession } from '../../components/auth/auth-session-provider';
import { PlanEditor } from '../../components/plans/plan-editor';
import { PlanForm } from '../../components/plans/plan-form';
import { PlanList } from '../../components/plans/plan-list';
import { EmptyState, Notice } from '../../components/ui/ui';

export default function PlansPage() {
  const { accessToken, ready, setToken } = useSession(); const [plans, setPlans] = useState<Plan[]>([]); const [selected, setSelected] = useState<Plan>(); const [error, setError] = useState('');
  useEffect(() => { if (accessToken) void plansApi.list(accessToken, setToken).then(setPlans).catch(() => setError('Não foi possível carregar seus planos.')); }, [accessToken, setToken]);
  const replace = (plan: Plan) => { setPlans((current) => [plan, ...current.filter((item) => item.id !== plan.id)]); setSelected(plan); };
  if (!ready) return <main className="page-wrap"><Notice>Verificando sessão…</Notice></main>;
  if (!accessToken) return <main className="page-wrap"><EmptyState title="Faça login para criar planos." /></main>;
  return <main className="app-shell">
    <aside className="app-sidebar" aria-label="Navegação principal">
      <div>
        <div className="brand"><span className="brand-mark" aria-hidden="true">✓</span><span><strong>Planejador BNCC</strong><small>Planejamento pedagógico</small></span></div>
        <nav className="sidebar-nav"><a href="/">Visão geral</a><a href="/planos" className="active" aria-current="page">Planos de aula</a><a href="/bncc">Explorador BNCC</a><a href="/seguranca">Segurança e sessões</a></nav>
      </div>
      <div className="sidebar-user"><span className="avatar" aria-hidden="true">P</span><span><strong>Professor(a)</strong><small>Sessão protegida</small></span></div>
    </aside>
    <section className="app-workspace">
      <header className="topbar"><div className="breadcrumb"><span>Planos de aula</span><b>›</b><strong>Gerar plano de aula</strong></div><span className="safe-badge"><i /> Ambiente seguro</span></header>
      <main className="page-wrap plans-page">
        <header className="page-header"><div><span className="eyebrow">Novo rascunho com IA</span><h1>Gerar plano de aula</h1><p>Selecione habilidades ativas da BNCC e informe o contexto de uma única aula. Você revisará tudo antes de finalizar.</p></div></header>
        <Notice>A IA prepara somente um rascunho. Nada será publicado ou finalizado automaticamente.</Notice>
        {error && <Notice tone="error">{error}</Notice>}
        <section className="results"><PlanForm onCreated={replace} />{selected && <PlanEditor plan={selected} onChanged={replace} />}</section>
        <PlanList plans={plans} onOpen={setSelected} />
      </main>
    </section>
  </main>;
}
