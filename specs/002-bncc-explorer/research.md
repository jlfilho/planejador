# Pesquisa: Explorador BNCC

## Exemplos ordenados

**Decisão**: modelar exemplos como entidade filha, não JSON.

**Racional**: As 141 habilidades analisadas possuem exemplos e podem conter vários. A entidade preserva ordem, valida lista não vazia e permite busca textual.

**Alternativa rejeitada**: JSON simplifica o schema, mas enfraquece ordenação, validação e índices de busca.

## Etapas por intervalo

**Decisão**: `anoInicial` e `anoFinal` iguais representam ano único; diferentes, faixa; ambos nulos, Educação Infantil.

**Racional**: A fonte contém `EF01`–`EF09`, `EF15`, `EF69` e `EM13`.

**Alternativa rejeitada**: forçar ano único perderia faixas oficiais; usar somente faixas reduziria precisão.

## Validação por nível

**Decisão**: CHECK SQL valida formato do intervalo e serviço/seed validam o nível pai: EI sem ano, EF 1–9, EM 1–3.

**Racional**: a regra depende de outra entidade; trigger SQL seria complexidade desproporcional.

## Busca indexada

**Decisão**: habilitar `pg_trgm` e GIN em código/textos pesquisáveis.

**Racional**: B-tree não atende `contains`/busca parcial. Motor externo é prematuro.

## Seed aditivo

**Decisão**: seed transacional cria somente itens ausentes e relata divergências.

**Racional**: reexecução não pode reativar ou sobrescrever a curadoria ADMIN.

## Sessão na web

**Decisão**: manter access token somente em memória; reidratar por refresh HttpOnly e repetir uma requisição uma única vez após 401.

**Racional**: a web atual descarta token de login/refresh e não consegue chamar recursos protegidos. Storage persistente aumenta risco de XSS; BFF ampliaria arquitetura sem necessidade.
