'use client';
import { Plan } from '../../lib/plans-api';
import { Button, EmptyState, Panel } from '../ui/ui';
export function PlanList({ plans, onOpen }: { plans: Plan[]; onOpen: (plan: Plan) => void }) { if (!plans.length) return <EmptyState title="Nenhum plano criado.">Gere um rascunho para começar.</EmptyState>; return <Panel><span className="eyebrow">Meus planos</span><h2>Planos de aula</h2><div className="entity-list">{plans.map((plan) => <div className="list-row" key={plan.id}><div className="list-row-main"><strong>{plan.status === 'RASCUNHO' ? 'Rascunho' : 'Finalizado'}</strong><span>{plan.aiRun.skills.map((skill) => skill.habilidade.codigo).join(', ')}</span></div><Button type="button" variant="ghost" onClick={() => onOpen(plan)}>Abrir</Button></div>)}</div></Panel>; }
