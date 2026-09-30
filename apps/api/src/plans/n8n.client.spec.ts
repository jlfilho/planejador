import 'reflect-metadata';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { N8nClient, N8nGenerationError } from './n8n.client';

const endpoint = 'https://jlfilho.app.n8n.cloud/webhook/agente-planejador-bncc';
const secret = 'a-local-test-secret-that-has-more-than-thirty-two-characters';
const request = { sessao: '550e8400-e29b-41d4-a716-446655440000', habilidade: 'EF01CO01 — Algoritmos', instrucao: 'Criar aula', duracao: 50, recursos_digitais: false };

const restore = (key: string, value: string | undefined) => value === undefined ? delete process.env[key] : (process.env[key] = value);
const configure = () => { process.env.N8N_WEBHOOK_URL = endpoint; process.env.N8N_INTEGRATION_SECRET = secret; process.env.N8N_AUTH_HEADER_NAME = 'x-api-key'; process.env.N8N_TIMEOUT_MS = '15000'; };

describe('N8nClient', () => {
  const values = ['N8N_WEBHOOK_URL', 'N8N_INTEGRATION_SECRET', 'N8N_AUTH_HEADER_NAME', 'N8N_TIMEOUT_MS'].map((key) => [key, process.env[key]] as const);
  afterEach(() => { vi.unstubAllGlobals(); values.forEach(([key, value]) => restore(key, value)); });

  it('serializes the workflow payload once and sends the configured header credential', async () => {
    configure(); const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true, sessao: request.sessao, habilidade: request.habilidade, answer: '# Aula', format: 'markdown' }), { status: 200 })); vi.stubGlobal('fetch', fetchMock);
    await new N8nClient().generate(request);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]; const body = init.body as string; const headers = init.headers as Record<string, string>;
    expect(url).toBe(endpoint); expect(JSON.parse(body)).toEqual(request); expect(headers['x-api-key']).toBe(secret); expect(headers['x-signature']).toBeUndefined();
  });

  it('rejects invalid schema and does not retry a conclusive HTTP failure', async () => {
    configure(); const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 })); vi.stubGlobal('fetch', fetchMock);
    await expect(new N8nClient().generate(request)).rejects.toMatchObject({ kind: 'invalid-response' } satisfies Partial<N8nGenerationError>); expect(fetchMock).toHaveBeenCalledTimes(1);
    fetchMock.mockResolvedValue(new Response('{}', { status: 401 })); await expect(new N8nClient().generate(request)).rejects.toMatchObject({ kind: 'rejected' } satisfies Partial<N8nGenerationError>); expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not retry an unavailable service because the workflow cannot deduplicate requests', async () => {
    configure(); const fetchMock = vi.fn().mockRejectedValue(new TypeError('network')); vi.stubGlobal('fetch', fetchMock);
    await expect(new N8nClient().generate(request)).rejects.toMatchObject({ kind: 'unavailable' } satisfies Partial<N8nGenerationError>);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('rejects an echoed session, skill, or additional field that does not match the contract', async () => {
    configure(); const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true, sessao: 'other-session', habilidade: request.habilidade, answer: '# Aula', format: 'markdown' }), { status: 200 })); vi.stubGlobal('fetch', fetchMock);
    await expect(new N8nClient().generate(request)).rejects.toMatchObject({ kind: 'invalid-response' } satisfies Partial<N8nGenerationError>);
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ success: true, sessao: request.sessao, habilidade: request.habilidade, answer: '# Aula', format: 'markdown', unexpected: true }), { status: 200 }));
    await expect(new N8nClient().generate(request)).rejects.toMatchObject({ kind: 'invalid-response' } satisfies Partial<N8nGenerationError>);
  });
});
