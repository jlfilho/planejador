# Pesquisa técnica: geração de planos por IA

## Execução e plano

**Decisão**: usar `AiRun` para a execução e `Plan` apenas para um resultado
válido. **Justificativa**: `PENDING`, `SUCCEEDED` e `FAILED` descrevem a chamada;
assim uma falha é auditável sem criar um plano parcial. **Alternativa rejeitada**:
guardar a execução no plano confundiria falha com rascunho editável.

## Autenticação no n8n e idempotência

**Decisão**: usar a credencial n8n HTTP Header Auth: a API envia
`N8N_INTEGRATION_SECRET` somente no cabeçalho configurado por
`N8N_AUTH_HEADER_NAME`. `requestId` e `idempotencyKey` ficam registrados no
backend para auditoria, mas não são enviados como requisito do workflow atual.
Não há retry automático. **Justificativa**: o workflow fornecido valida Header
Auth e aceita apenas `sessao`, `habilidade`, `instrucao`, `duracao` e
`recursos_digitais`; ele não implementa HMAC nem deduplicação. **Alternativa
rejeitada**: inventar HMAC ou retransmissão mudaria o contrato publicado e pode
duplicar geração; transmitir JWT ou outros segredos viola a Constituição.

## Cliente HTTP

**Decisão**: `fetch`, `AbortSignal.timeout` e `crypto` nativos do Node 22, URL
HTTPS e timeout máximo de 30 segundos. **Justificativa**: não adiciona biblioteca
e valida resposta antes da persistência. **Alternativa rejeitada**: fila/worker
amplia o escopo; Axios não é necessário.

## Ownership e concorrência

**Decisão**: PROFESSOR filtra por `ownerId`; ADMIN só é exceção explícita para
leitura/alteração de rascunho. Atualizações condicionam `RASCUNHO`, mas não usam
versionamento: último salvamento recebido prevalece. **Alternativa rejeitada**:
confiar na UI viola a Constitution; optimistic locking contradiz a clarification.

## Conteúdo humano, referências e interface

**Decisão**: validar Markdown e permitir edição apenas em rascunho. Referências
retornadas são preservadas; quando o n8n não devolver nenhuma, o professor pode
adicionar referências manuais opcionais. Dados originais e habilidades ficam
imutáveis no `AiRun`. A interface segue os nove protótipos Figma da spec, com
uma área administrativa dedicada a ADMIN. **Alternativa rejeitada**: rejeitar
resultado válido por não haver referências, salvar corpo externo sem schema ou
misturar a administração na lista pessoal do professor.
