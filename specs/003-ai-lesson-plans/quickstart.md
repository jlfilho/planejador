# Quickstart de validação: planos de aula por IA

## Preparação

Configure PostgreSQL e `apps/api/.env` não versionado com valores reais de
`DATABASE_URL`, `JWT_ACCESS_SECRET`, `WEB_ORIGIN`, `N8N_WEBHOOK_URL`,
`N8N_INTEGRATION_SECRET`, `N8N_AUTH_HEADER_NAME` e `N8N_TIMEOUT_MS`.
`apps/api/.env.example` terá apenas valores fictícios. A URL n8n é a do
[contrato](contracts/n8n-webhook.md).

```powershell
pnpm --filter @planejador/api prisma:generate
pnpm --filter @planejador/api prisma:migrate
pnpm dev
```

## Cenários manuais

1. PROFESSOR gera rascunho com habilidades ativas, instrução, duração e recursos;
   confirme Markdown, aviso de IA e referências retornadas ou a possibilidade de
   incluir referências manuais opcionais quando a resposta não as trouxer.
2. Edite, salve e finalize explicitamente; confirme que plano finalizado não muda.
3. Outro PROFESSOR não lê, salva nem finaliza por ID; ADMIN acessa a área
   administrativa dedicada, lê/edita rascunho sem mudar o dono e com auditoria.
4. No workflow n8n, teste credencial de cabeçalho inválida; confirme rejeição.
   Simule timeout, indisponibilidade e schema inválido; confirme entrada
   preservada e ausência de plano parcial.
5. Confirme que uma falha não recebe retry automático e que `requestId` e
   `idempotencyKey` permanecem auditáveis no backend.
6. Execute teste moderado com ao menos 10 professores; a aprovação exige pelo
   menos 90% solicitando, revisando e salvando um rascunho em até cinco minutos.

## Gates

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm test:integration
pnpm test:e2e
pnpm build
```

Use banco isolado e mock do n8n. Consulte [data-model.md](data-model.md) e os
contratos em [contracts](contracts/).
