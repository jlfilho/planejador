import { apiRequest } from './api-client';

export type PlanReference = { id?: string; title: string; url?: string; citation?: string };
export type Plan = { id: string; ownerId: string; owner: { id: string; email: string }; status: 'RASCUNHO' | 'FINALIZADO'; markdown: string; aiAssisted: true; references: PlanReference[]; aiRun: { skills: { habilidade: { id: string; codigo: string; descricao: string } }[] } };
export type PlanInput = { skillIds: string[]; instruction: string; durationMinutes: number; usesDigitalResources: boolean };
type TokenSetter = (token?: string) => void;

export const plansApi = {
  generate: (input: PlanInput, token: string, setToken: TokenSetter) => apiRequest<Plan>('/plans/generations', token, setToken, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) }),
  list: (token: string, setToken: TokenSetter) => apiRequest<Plan[]>('/plans', token, setToken),
  detail: (id: string, token: string, setToken: TokenSetter) => apiRequest<Plan>(`/plans/${id}`, token, setToken),
  update: (id: string, data: Pick<Plan, 'markdown' | 'references'>, token: string, setToken: TokenSetter) => apiRequest<Plan>(`/plans/${id}`, token, setToken, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) }),
  finalize: (id: string, token: string, setToken: TokenSetter) => apiRequest<Plan>(`/plans/${id}/finalize`, token, setToken, { method: 'POST' }),
};
