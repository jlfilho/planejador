# Tarefas: Alinhamento da UI ao Figma

**Entrada**: Artefatos em `/specs/004-figma-ui-alignment/`

**Pré-requisitos**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/ui-alignment.md` e `quickstart.md`.

**Escopo confirmado**: Atualizar somente os fluxos web já existentes. Os frames
de administração de contas (`2:16303`), segurança e sessões como tela própria
(`2:16141`) e auditoria de autenticação (`2:16591`) não criam rotas, dados ou
operações nesta Feature 004; devem ser especificados em features separadas.

## Formato: `[ID] [P?] [Story] Descrição`

- **[P]**: pode ser executada em paralelo, em arquivos independentes.
- **[US1]** e **[US2]**: mapeiam às histórias da specification.

## Fase 1: Preparação compartilhada

**Objetivo**: Registrar os frames em escopo e preparar os recursos visuais sem
alterar os fluxos de negócio.

- [X] T001 Registrar o mapeamento dos frames Figma em escopo (`2:15729`, `2:15795`, `2:15887`, `6:18955`, `6:19236`, `6:19489`, `6:19106`, `6:19383`, `6:19630`, `6:19859` e `6:20031`) em `specs/004-figma-ui-alignment/contracts/ui-alignment.md`.
- [X] T002 Criar a fundação visual compartilhada e os estilos responsivos em `apps/web/app/globals.css` e aplicá-los em `apps/web/app/layout.tsx`.
- [X] T003 [P] Consultar cada frame em escopo pelo MCP Figma, baixar somente os assets estáticos usados e salvar os arquivos locais em `apps/web/public/figma/`.

---

## Fase 2: Fundação bloqueante

**Objetivo**: Criar componentes de apresentação reutilizáveis sem mover a lógica
de sessão, catálogo ou autorização.

- [X] T004 Criar componentes semânticos e acessíveis de layout, painel, campo, botão, alerta, estado vazio e diálogo em `apps/web/components/ui/`, reutilizando `role="alert"` e `role="status"` onde aplicável.
- [X] T005 Integrar os componentes visuais compartilhados sem alterar `apps/web/lib/auth.ts`, `apps/web/lib/api-client.ts` ou `apps/web/lib/bncc-api.ts`.
- [X] T006 [P] Criar testes de apresentação dos componentes compartilhados em `apps/web/components/ui/*.spec.tsx`.

**Checkpoint**: a base visual está disponível e as chamadas de API, sessão, RBAC
e ownership continuam fora dos componentes de apresentação.

---

## Fase 3: História de Usuário 1 — Utilizar telas alinhadas ao design (Prioridade: P1) 🎯 MVP

**Objetivo**: Entregar as telas existentes de autenticação e catálogo com a
hierarquia visual do Figma, preservando todos os fluxos autorizados.

**Teste independente**: Em desktop e mobile, um usuário consegue autenticar-se,
registrar-se, renovar/encerrar a sessão, consultar o catálogo e, como ADMIN,
administrá-lo; as ações e dados reais continuam intactos.

### Testes da História de Usuário 1

- [X] T007 [P] [US1] Criar testes de login, registro, renovação e logout preservando as chamadas existentes em `apps/web/app/page.spec.tsx`.
- [X] T008 [P] [US1] Estender testes do explorador para filtros, detalhes locais de habilidade, paginação e conteúdo real em `apps/web/components/bncc/catalog-explorer.spec.tsx`.
- [X] T009 [P] [US1] Estender testes da administração para criar, editar e ativar/desativar catálogo sem substituir a validação do backend em `apps/web/components/bncc/catalog-admin.spec.tsx`.

### Implementação da História de Usuário 1

- [X] T010 [US1] Atualizar a tela de entrada com os frames Figma `2:15729` e `2:15795` em `apps/web/app/page.tsx`, preservando login, registro, renovação e logout já existentes.
- [X] T011 [US1] Aplicar à área de sessão existente os padrões visuais do frame `2:16141` em `apps/web/app/page.tsx`, sem criar nova rota, histórico de sessões ou ação adicional.
- [X] T012 [US1] Atualizar o explorador com os frames `6:18955`, `6:19236`, `6:19489` e `6:19106` em `apps/web/components/bncc/catalog-explorer.tsx`, preservando filtros combináveis, busca, paginação e os dados retornados pela API.
- [X] T013 [US1] Atualizar a administração do catálogo com os frames `6:19630`, `6:19859` e `6:20031` em `apps/web/components/bncc/catalog-admin.tsx`, substituindo apenas a apresentação dos prompts por controles acessíveis e mantendo a autorização ADMIN no backend.
- [X] T014 [US1] Ajustar os contêineres das rotas do catálogo para a estrutura visual responsiva aprovada em `apps/web/app/catalogo-bncc/page.tsx` e `apps/web/app/catalogo-bncc/admin/page.tsx`.
- [X] T015 [US1] Criar verificações E2E dos fluxos existentes de autenticação e catálogo em desktop e mobile em `apps/web/e2e/ui-alignment.spec.ts`.

**Checkpoint**: A UI existente está alinhada aos frames em escopo e continua
funcional sem novas rotas de contas, sessões ou auditoria.

---

## Fase 4: História de Usuário 2 — Compreender estados da interface (Prioridade: P2)

**Objetivo**: Tornar carregamento, erro e ausência de resultados claros e
consistentes com os frames Figma, sem revelar informação sensível.

**Teste independente**: Em desktop e mobile, falha de autenticação, carregamento
de catálogo e busca sem resultado mostram estados claros; nenhuma mensagem expõe
se uma conta existe ou altera privilégios.

### Testes da História de Usuário 2

- [X] T016 [P] [US2] Adicionar testes de mensagem genérica de falha de autenticação e de estados de renovação de sessão em `apps/web/app/page.spec.tsx`.
- [X] T017 [P] [US2] Adicionar testes de carregamento, erro e nenhum resultado do catálogo em `apps/web/components/bncc/catalog-explorer.spec.tsx`.
- [X] T018 [P] [US2] Adicionar testes de carregamento, erro e aviso de permissão ADMIN em `apps/web/components/bncc/catalog-admin.spec.tsx`.

### Implementação da História de Usuário 2

- [X] T019 [US2] Implementar o estado visual de erro do frame `2:15887` em `apps/web/app/page.tsx`, mantendo a mensagem de autenticação genérica e sem expor existência de conta.
- [X] T020 [US2] Implementar os estados de carregamento, filtro inválido, detalhe local e nenhum resultado do frame `6:19383` em `apps/web/components/bncc/catalog-explorer.tsx`.
- [X] T021 [US2] Implementar estados de carregamento, sucesso, erro e acesso ADMIN negado com os componentes compartilhados em `apps/web/components/bncc/catalog-admin.tsx`.
- [X] T022 [US2] Cobrir por Playwright os estados de erro de autenticação e de resultado vazio em `apps/web/e2e/ui-alignment.spec.ts`.

**Checkpoint**: Estados críticos estão compreensíveis, acessíveis e não alteram
as regras de segurança existentes.

---

## Fase 5: Polimento e validação transversal

**Objetivo**: Verificar fidelidade, responsividade, assets e barreiras de
qualidade antes da entrega.

- [X] T023 [P] Revisar cada frame em escopo contra screenshots desktop e mobile, documentar divergências em `specs/004-figma-ui-alignment/contracts/ui-alignment.md` e obter aprovação humana antes da conclusão.
- [X] T024 [P] Verificar que todos os assets em `apps/web/public/figma/` existem localmente, possuem geometria correta e não deixam URLs temporárias do Figma em `apps/web/`.
- [X] T025 Executar `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e` e `pnpm build` conforme `specs/004-figma-ui-alignment/quickstart.md`.

## Dependências e ordem de execução

- **Fase 1** não possui dependências.
- **Fase 2** depende de T001–T003 e bloqueia as histórias.
- **US1** depende da Fase 2 e é o MVP.
- **US2** depende da Fase 2 e pode iniciar após a base visual; deve ser integrada
  depois de T010–T014 para evitar conflito nos mesmos arquivos.
- **Polimento** depende de US1 e US2.

## Oportunidades de paralelismo

- T002 e T003 podem iniciar em paralelo após T001.
- T006 pode ser realizado em paralelo com a implementação dos componentes de T004.
- T007, T008 e T009 podem ser preparados em paralelo em arquivos distintos.
- T016, T017 e T018 podem ser preparados em paralelo em arquivos distintos.
- T023 e T024 podem ser realizados em paralelo depois que as telas estiverem prontas.

## Estratégia de implementação

### MVP

1. Concluir T001–T006.
2. Concluir T007–T015 para as telas e fluxos existentes.
3. Validar desktop e mobile antes de avançar para estados adicionais.

### Entregas incrementais

1. Base visual e assets locais.
2. Autenticação e catálogo alinhados ao Figma.
3. Estados de erro, vazio e carregamento.
4. Revisão visual aprovada e barreiras de qualidade.

## Validação de formato

Todas as tarefas usam checkbox, identificador sequencial, marcador `[P]` apenas
quando aplicável, rótulo de história nas fases de história e caminho de arquivo
explícito.

---

## Fase 6: Convergência

- [X] T026 Reutilizar o componente `Dialog` de `apps/web/components/ui/ui.tsx` para o detalhe local de habilidade em `apps/web/components/bncc/catalog-explorer.tsx`, preservando fechamento por botão e clique externo, `role="dialog"` e `aria-modal` (plan: componentes de apresentação reutilizáveis; parcial).

---

## Fase 7: Convergência

- [X] T027 Registrar em `specs/004-figma-ui-alignment/contracts/ui-alignment.md` a revisão desktop/mobile de cada frame em escopo e a aprovação humana de cada divergência necessária, conforme FR-007 e SC-001, SC-004 e SC-005 (missing).
