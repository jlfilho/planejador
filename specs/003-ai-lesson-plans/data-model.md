# Modelo de dados: planos de aula por IA

## Enums

- `PlanStatus`: `RASCUNHO`, `FINALIZADO`.
- `AiRunStatus`: `PENDING`, `SUCCEEDED`, `FAILED`.

## AiRun

| Campo | Regra |
|---|---|
| `id` | UUID. |
| `requesterId` | Usuário obrigatório que solicitou a geração. |
| `requestId` / `idempotencyKey` | UUIDs únicos mantidos para rastreabilidade e auditoria da solicitação. |
| `status` | Começa `PENDING` e termina em `SUCCEEDED` ou `FAILED`. |
| `instruction` | Obrigatória, não vazia e imutável. |
| `durationMinutes` | Inteiro obrigatório e estritamente positivo, imutável. |
| `usesDigitalResources` | Boolean obrigatório e imutável. |
| `attemptCount` | Inteiro positivo que registra a tentativa executada; não há retry automático enquanto o workflow não deduplicar solicitações. |
| `failureCode` | Nulo em sucesso; código seguro, sem resposta bruta ou segredo. |

Relações: `User 1:N AiRun`, `AiRun 1:N AiRunSkill`, `AiRun 0..1:1 Plan`.
Índices: `(requesterId, createdAt)`, `(status, createdAt)` e unicidade de
`requestId` e `idempotencyKey`.

## AiRunSkill

| Campo | Regra |
|---|---|
| `aiRunId` | Execução obrigatória. |
| `habilidadeBNCCId` | Habilidade global obrigatória, existente e ativa na solicitação. |
| `ordem` | Positiva e única por execução. |

Unicidades: `(aiRunId, habilidadeBNCCId)` e `(aiRunId, ordem)`. A relação é só
de leitura em relação ao catálogo e usa `onDelete: Restrict`.

## Plan e PlanReference

| Campo | Regra |
|---|---|
| `Plan.ownerId` | Obrigatório e imutável; professor solicitante. |
| `Plan.aiRunId` | Obrigatório e único; origem bem-sucedida. |
| `Plan.status` | Nasce `RASCUNHO`; apenas `RASCUNHO -> FINALIZADO`. |
| `Plan.markdown` | Obrigatório, não vazio; editável apenas em rascunho. |
| `Plan.aiAssisted` | Sempre `true`; não removível pela edição. |
| `PlanReference.title` | Obrigatório e não vazio; pode ser incluído manualmente pelo professor enquanto o plano estiver em `RASCUNHO`. |
| `PlanReference.url` | Opcional; se presente, HTTPS válida. |
| `PlanReference.citation` | Opcional. |
| `PlanReference.ordem` | Positiva e única por plano. |

Relações: `User 1:N Plan`, `AiRun 1:1 Plan`, `Plan 1:N PlanReference`.
Índices: `(ownerId, status, updatedAt)`, `(status, updatedAt)` e
`(planId, ordem)` único.

## Transições e acesso

```text
AiRun: PENDING -> SUCCEEDED (terminal)
              -> FAILED    (terminal)
Plan:  RASCUNHO -> FINALIZADO (terminal)
```

Somente `AiRun SUCCEEDED` cria `Plan` na mesma transação. A ausência de
`PlanReference` retornada pela geração é válida; referências manuais são
opcionais e só podem ser incluídas ou alteradas em rascunho. PROFESSOR somente
usa seu `ownerId`; ADMIN consulta qualquer plano e altera apenas rascunho sem
trocar o dono. Mudança após finalização conflita; salvamentos concorrentes válidos
seguem o último recebido.
