'use client';
import { FormEvent, useEffect, useId, useState } from 'react';
import { catalogApi, Skill } from '../../lib/bncc-api';
import { Plan, plansApi } from '../../lib/plans-api';
import { useSession } from '../auth/auth-session-provider';
import { Button, Notice, Panel } from '../ui/ui';

export function PlanForm({ onCreated }: { onCreated: (plan: Plan) => void }) {
  const { accessToken, setToken } = useSession();
  const suggestionsId = useId();
  const [skills, setSkills] = useState<Skill[]>([]); const [skillIds, setSkillIds] = useState<string[]>([]); const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]); const [query, setQuery] = useState(''); const [searching, setSearching] = useState(false); const [instruction, setInstruction] = useState(''); const [durationMinutes, setDurationMinutes] = useState(50); const [usesDigitalResources, setUsesDigitalResources] = useState(false); const [pending, setPending] = useState(false); const [error, setError] = useState('');
  useEffect(() => {
    const text = query.trim();
    if (!accessToken || text.length < 2) { setSkills([]); setSearching(false); return; }
    let current = true;
    const timer = window.setTimeout(() => {
      setSearching(true);
      void catalogApi.skills({ q: text, page: 1, pageSize: 20 }, accessToken, setToken)
        .then((page) => { if (current) setSkills(page.data); })
        .catch(() => { if (current) setError('Não foi possível pesquisar as habilidades BNCC.'); })
        .finally(() => { if (current) setSearching(false); });
    }, 250);
    return () => { current = false; window.clearTimeout(timer); };
  }, [accessToken, query, setToken]);
  const selectSkill = (skill: Skill) => { setSkillIds((current) => current.includes(skill.id) ? current : [...current, skill.id]); setSelectedSkills((current) => current.some((item) => item.id === skill.id) ? current : [...current, skill]); setQuery(''); setSkills([]); };
  const removeSkill = (id: string) => { setSkillIds((current) => current.filter((skillId) => skillId !== id)); setSelectedSkills((current) => current.filter((skill) => skill.id !== id)); };
  async function submit(event: FormEvent) {
    event.preventDefault(); if (!accessToken || !skillIds.length || !instruction.trim() || durationMinutes < 1) { setError('Selecione habilidades e informe instrução e duração válidas.'); return; }
    try { setPending(true); setError(''); const plan = await plansApi.generate({ skillIds, instruction, durationMinutes, usesDigitalResources }, accessToken, setToken); onCreated(plan); }
    catch { setError('A geração não foi concluída. Confira os dados e tente novamente.'); }
    finally { setPending(false); }
  }
  const selectedCount = selectedSkills.length;
  return <form className="plan-generation-form" onSubmit={submit}>
    <div className="plan-form-main">
      <Panel className="plan-card skills-card"><div className="card-heading"><div><h2>Habilidades BNCC</h2><p>Escolha uma ou mais habilidades válidas e ativas.</p></div><span className="count-badge">{selectedCount} selecionada{selectedCount === 1 ? '' : 's'}</span></div>
        <fieldset className="field"><legend className="sr-only">Habilidades BNCC</legend>
          {selectedSkills.length > 0 && <ul className="skill-chips" aria-label="Habilidades selecionadas">{selectedSkills.map((skill) => <li key={skill.id}><strong>{skill.codigo}</strong><span>{skill.descricao}</span><Button type="button" variant="ghost" onClick={() => removeSkill(skill.id)} aria-label={`Remover ${skill.codigo}`}>×</Button></li>)}</ul>}
          <label htmlFor={suggestionsId}>Buscar por código ou texto</label>
          <div className="search-input"><span aria-hidden="true">⌕</span><input id={suggestionsId} role="combobox" aria-autocomplete="list" aria-controls={`${suggestionsId}-listbox`} aria-expanded={skills.length > 0} value={query} onChange={(event) => { setError(''); setQuery(event.target.value); }} placeholder="Ex.: EF01CO01 ou algoritmo" autoComplete="off" /></div>
          {searching && <p role="status" className="field-help">Buscando habilidades…</p>}
          {query.trim().length > 0 && query.trim().length < 2 && <p className="field-help">Digite ao menos 2 caracteres para pesquisar.</p>}
          {!searching && query.trim().length >= 2 && skills.length === 0 && <p className="field-help">Nenhuma habilidade encontrada.</p>}
          {skills.length > 0 && <ul className="skill-results" id={`${suggestionsId}-listbox`} role="listbox" aria-label="Sugestões de habilidades BNCC">{skills.map((skill) => <li key={skill.id} role="option" aria-selected={skillIds.includes(skill.id)}><Button type="button" variant="ghost" onClick={() => selectSkill(skill)}><strong>{skill.codigo}</strong><span>{skill.etapa.nome}</span><em>{skill.eixo ?? 'Eixo pendente'}</em><small>{skill.descricao}</small></Button></li>)}</ul>}
        </fieldset>
      </Panel>
      <Panel className="plan-card"><h2>Contexto pedagógico</h2><label className="field">Instrução pedagógica<textarea value={instruction} onChange={(event) => setInstruction(event.target.value)} placeholder="Inclua objetivos, perfil da turma ou estratégia que deve orientar o rascunho." required /></label><div className="compact-fields"><label className="field">Duração (minutos)<input type="number" min="1" value={durationMinutes} onChange={(event) => setDurationMinutes(Number(event.target.value))} required /><span className="field-help">Informe um valor positivo.</span></label></div></Panel>
    </div>
    <aside className="plan-form-side"><Panel className="plan-card"><div className="card-heading"><h3>Usará recursos digitais?</h3><span className="required-badge">Obrigatório</span></div><p>Escolha uma opção para adequar atividades e materiais.</p><div className="radio-options" role="radiogroup" aria-label="Uso de recursos digitais"><button type="button" role="radio" aria-checked={usesDigitalResources} className={usesDigitalResources ? 'selected' : ''} onClick={() => setUsesDigitalResources(true)}><i aria-hidden="true" /> Sim, com recursos digitais</button><button type="button" role="radio" aria-checked={!usesDigitalResources} className={!usesDigitalResources ? 'selected' : ''} onClick={() => setUsesDigitalResources(false)}><i aria-hidden="true" /> Não, sem recursos digitais</button></div></Panel>
      <Panel className="plan-card request-summary"><h3>Resumo da solicitação</h3><ul><li><span>◫</span>{selectedCount} habilidade{selectedCount === 1 ? '' : 's'} ativa{selectedCount === 1 ? '' : 's'}</li><li><span>◷</span>{durationMinutes || 0} minutos</li><li><span>▣</span>{usesDigitalResources ? 'Com recursos digitais' : 'Sem recursos digitais'}</li><li><span>▤</span>Uma única aula · novo rascunho</li></ul><div className="summary-note"><strong>Rascunho independente</strong><span>Uma nova geração não sobrescreve este plano.</span></div></Panel>
      {error && <Notice tone="error">{error}</Notice>}
      <Button className="generate-button" type="submit" disabled={pending} aria-label={pending ? 'Gerando rascunho' : 'Gerar plano de aula'}>{pending ? 'Gerando rascunho…' : '✦ Gerar rascunho com IA'}</Button><p className="submit-help">Ao continuar, você envia somente os dados acima para preparar um rascunho editável.</p>
    </aside>
  </form>;
}
