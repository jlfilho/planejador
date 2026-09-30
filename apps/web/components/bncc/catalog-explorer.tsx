'use client';

import React, { useEffect, useState } from 'react';
import { catalogApi, Level, Page, Skill, Stage } from '../../lib/bncc-api';
import { useSession } from '../auth/auth-session-provider';
import { Button, Dialog, EmptyState, Notice, Panel } from '../ui/ui';

const axes = [['PENSAMENTO_COMPUTACIONAL', 'Pensamento Computacional'], ['MUNDO_DIGITAL', 'Mundo Digital'], ['CULTURA_DIGITAL', 'Cultura Digital']];

export function CatalogExplorer() {
  const { accessToken, ready, setToken } = useSession();
  const [levels, setLevels] = useState<Level[]>([]); const [stages, setStages] = useState<Stage[]>([]);
  const [levelId, setLevelId] = useState(''); const [stageId, setStageId] = useState(''); const [axis, setAxis] = useState(''); const [q, setQ] = useState(''); const [year, setYear] = useState(''); const [page, setPage] = useState(1);
  const [result, setResult] = useState<Page>(); const [error, setError] = useState(''); const [loading, setLoading] = useState(false); const [selected, setSelected] = useState<Skill>();

  useEffect(() => { if (accessToken) catalogApi.levels(accessToken, setToken).then(setLevels).catch(() => setError('Não foi possível carregar níveis.')); }, [accessToken, setToken]);
  useEffect(() => { if (accessToken && levelId) catalogApi.stages(levelId, accessToken, setToken).then(setStages).catch(() => setError('Não foi possível carregar etapas.')); else setStages([]); setStageId(''); setYear(''); }, [accessToken, levelId, setToken]);
  useEffect(() => {
    if (!accessToken) return;
    setLoading(true); setError('');
    catalogApi.skills({ levelId: levelId || undefined, stageId: stageId || undefined, axis: axis || undefined, q: q || undefined, year: year ? Number(year) : undefined, page }, accessToken, setToken)
      .then(setResult).catch(() => setError('Confira os filtros e tente novamente.')).finally(() => setLoading(false));
  }, [accessToken, levelId, stageId, axis, q, year, page, setToken]);

  if (!ready) return <div className="page-wrap"><Notice>Verificando sessão…</Notice></div>;
  if (!accessToken) return <div className="page-wrap"><EmptyState title="Faça login para consultar o catálogo." /></div>;
  const isEarlyEducation = levels.find(level => level.id === levelId)?.codigo === 'EDUCACAO_INFANTIL';
  const totalPages = result ? Math.max(1, Math.ceil(result.meta.total / result.meta.pageSize)) : 1;
  const update = (setter: (value: string) => void) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { setter(event.target.value); setPage(1); };

  return <div className="page-wrap">
    <header className="page-header"><div><span className="eyebrow">Base curricular</span><h1>Explorador BNCC</h1><p>Localize habilidades de Computação por nível, etapa, eixo e termos do currículo.</p></div><a className="brand" href="/"><span className="brand-mark" aria-hidden="true">✓</span><span>Planejador BNCC</span></a></header>
    <div className="catalog-layout">
      <Panel className="filters" aria-label="Filtros do catálogo">
        <div><span className="eyebrow">Refine a busca</span><h2>Filtros</h2></div>
        <label className="field">Nível<select value={levelId} onChange={update(setLevelId)}><option value="">Todos</option>{levels.map(level => <option key={level.id} value={level.id}>{level.nome}</option>)}</select></label>
        <label className="field">Etapa<select value={stageId} onChange={update(setStageId)}><option value="">Todas</option>{stages.map(stage => <option key={stage.id} value={stage.id}>{stage.nome}</option>)}</select></label>
        {!isEarlyEducation && levelId && <label className="field">Ano<input type="number" min="1" value={year} onChange={update(setYear)} /></label>}
        <label className="field">Eixo<select value={axis} onChange={update(setAxis)}><option value="">Todos</option>{axes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="field">Busca<input placeholder="Código ou palavra-chave" value={q} onChange={update(setQ)} /></label>
        <Button type="button" variant="secondary" onClick={() => { setLevelId(''); setStageId(''); setAxis(''); setQ(''); setYear(''); setPage(1); }}>Limpar filtros</Button>
      </Panel>
      <section className="results" aria-live="polite">
        <Panel><span className="eyebrow">Habilidades encontradas</span><h2>{loading ? 'Buscando no catálogo…' : result ? `${result.meta.total} habilidade${result.meta.total === 1 ? '' : 's'}` : 'Carregando catálogo…'}</h2>{error && <Notice tone="error">{error}</Notice>}</Panel>
        {loading && <Panel><p>Carregando habilidades e filtros disponíveis…</p></Panel>}
        {!loading && result?.data.length === 0 && <EmptyState title="Nenhuma habilidade encontrada.">Ajuste os filtros ou tente outro termo de busca.</EmptyState>}
        {!loading && result?.data.map(skill => <article className="panel skill-card" key={skill.id}><span className="eyebrow">{skill.eixo ?? 'Eixo pendente'}</span><h2>{skill.codigo} — {skill.descricao}</h2><p>{skill.explicacao}</p><div className="button-row"><Button variant="ghost" className="small" onClick={() => setSelected(skill)}>Ver detalhes</Button></div></article>)}
        {result && <nav className="panel panel-pad pagination" aria-label="Paginação"><Button variant="ghost" disabled={page === 1} onClick={() => setPage(page - 1)}>Anterior</Button><span>Página {page} de {totalPages}</span><Button variant="ghost" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Próxima</Button></nav>}
      </section>
    </div>
    {selected && <Dialog title={`Detalhe da habilidade ${selected.codigo}`} onClose={() => setSelected(undefined)}><h3>{selected.descricao}</h3><p>{selected.explicacao}</p><h3>Exemplos</h3>{selected.exemplos.length ? <ul>{selected.exemplos.map((example, index) => <li key={index}>{example.texto}</li>)}</ul> : <p>Não há exemplos cadastrados.</p>}</Dialog>}
  </div>;
}
