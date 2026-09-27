# Especificação da Feature: Explorador BNCC

**Branch da Feature**: `feat/002-bncc-explorer`

**Criada em**: 2026-09-26

**Status**: Rascunho

**Entrada**: Descrição do usuário: "Explorador BNCC para consulta docente e gestão administrativa do catálogo de Computação."

## Clarificações

### Sessão 2026-09-26

- P: O catálogo deve preservar etapas que abrangem uma faixa de anos, além das etapas de ano único? → R: Etapas podem representar um ano único ou uma faixa de anos; Educação Infantil não possui ano.
- P: Depois de criada, uma habilidade pode ter seu código BNCC alterado por ADMIN? → R: O código é globalmente único e imutável após a criação; ADMIN pode editar os demais campos da habilidade.
- P: Uma habilidade BNCC deve pertencer a exatamente um eixo ou pode ser classificada em mais de um eixo? → R: Uma habilidade pode permanecer com eixo pendente; quando classificada, pertence a exatamente um dos três eixos válidos.
- P: Os exemplos de uma habilidade devem ser obrigatórios e poder conter mais de uma proposta pedagógica? → R: Toda habilidade deve ter ao menos um exemplo e pode reunir vários exemplos na ordem definida pela curadoria.
- P: Como a consulta deve combinar busca por código ou texto, ordenação e divisão dos resultados em páginas? → R: Busca por código completo ou parcial e texto; combina com filtros; ordem crescente de código; resultados em páginas.

## Cenários de Usuário e Testes *(obrigatório)*

### História de Usuário 1 - Explorar habilidades BNCC (Prioridade: P1)

Como professor autenticado, quero explorar o catálogo de Computação da BNCC e
filtrar habilidades por nível de ensino, etapa/ano e eixo para encontrar o
conteúdo aplicável ao meu contexto de ensino.

**Por que esta prioridade**: A consulta confiável do catálogo é o valor central
da feature e possibilita que docentes localizem habilidades antes de planejar.

**Teste independente**: Um professor autenticado consulta o catálogo, combina
filtros válidos e localiza as habilidades correspondentes, sem depender da
gestão administrativa.

**Cenários de aceitação**:

1. **Dado** que um professor autenticado acessa o catálogo, **Quando** consulta
   sem filtros, **Então** visualiza as habilidades ativas de Computação com
  código, etapa, eixo quando classificado, descrição, explicação e exemplos.
2. **Dado** que existem habilidades para combinações distintas de nível,
   etapa/ano e eixo, **Quando** o professor aplica uma ou mais dessas opções,
   **Então** recebe somente habilidades que atendem a todos os filtros escolhidos.
3. **Dado** que o professor seleciona Educação Infantil, **Quando** explora o
   catálogo, **Então** não precisa informar ano e visualiza apenas etapas válidas
   desse nível.
4. **Dado** que o professor seleciona Ensino Fundamental ou Ensino Médio,
   **Quando** escolhe uma etapa válida de ano único ou faixa de anos, **Então**
   pode restringir o resultado ao recorte educacional correspondente.
5. **Dado** que nenhum item atende aos filtros válidos, **Quando** a consulta é
   concluída, **Então** a interface informa que não há resultados sem apresentar
   erro como se a consulta fosse inválida.
6. **Dado** que o professor informa um código completo, parte de um código ou um
   texto de habilidade, **Quando** combina a busca com filtros válidos, **Então**
   recebe resultados paginados que atendem a todos os critérios e são ordenados
   crescentemente por código.

---

### História de Usuário 2 - Validar consultas ao catálogo (Prioridade: P2)

Como professor autenticado, quero receber uma orientação clara quando informo
uma combinação de filtros inválida para corrigir a busca sem resultados enganosos.

**Por que esta prioridade**: Filtros coerentes evitam que docentes confundam
entrada inválida com ausência de habilidades no catálogo.

**Teste independente**: Um professor tenta consultar uma etapa que não pertence
ao nível escolhido ou um eixo não permitido e recebe uma rejeição compreensível,
sem resultado parcial ou dados indevidos.

**Cenários de aceitação**:

1. **Dado** que o professor escolheu um nível de ensino, **Quando** informa uma
   etapa que pertence a outro nível, **Então** o sistema rejeita a combinação e
   explica que a etapa não é válida para o nível selecionado.
2. **Dado** que o professor tenta filtrar por ano na Educação Infantil, **Quando**
   envia a consulta, **Então** o sistema rejeita a entrada e informa que esse
   recorte não possui ano.
3. **Dado** que o professor informa um eixo fora dos três eixos definidos,
   **Quando** envia a consulta, **Então** o sistema rejeita a entrada sem executar
   uma busca ambígua.

---

### História de Usuário 3 - Administrar o catálogo BNCC (Prioridade: P2)

Como ADMIN autenticado, quero criar, editar e desativar níveis, etapas e
habilidades do catálogo para manter o conteúdo global atualizado, sem permitir
que professores modifiquem esse acervo.

**Por que esta prioridade**: A curadoria administrativa mantém o catálogo útil e
consistente para todos os professores.

**Teste independente**: Um ADMIN cria ou altera um item e desativa uma habilidade;
um PROFESSOR comprova que não pode executar essas ações e que o item desativado
não aparece em sua consulta.

**Cenários de aceitação**:

1. **Dado** que um ADMIN autenticado fornece dados válidos, **Quando** cria ou
   edita um nível, etapa ou habilidade, **Então** a alteração fica disponível na
   consulta do catálogo conforme seu estado ativo, sem alterar o código de uma
   habilidade já criada.
2. **Dado** que um ADMIN autenticado desativa uma habilidade, **Quando** um
   professor consulta o catálogo, **Então** a habilidade desativada não aparece.
3. **Dado** que um ADMIN desativa um nível ou etapa, **Quando** um professor
   consulta o catálogo, **Então** nenhum descendente dessa cadeia aparece. Ao
   reativar o ancestral, somente descendentes que permanecem ativos voltam a
   aparecer.
4. **Dado** que um PROFESSOR autenticado tenta criar, editar ou desativar um item,
   **Quando** a solicitação chega ao backend, **Então** a operação é negada.
5. **Dado** que um ADMIN tenta associar uma etapa a mais de um nível ou criar uma
   habilidade com código já existente, **Quando** envia a alteração, **Então** o
   sistema a rejeita sem alterar o catálogo.

### Casos de Borda

- Educação Infantil não aceita filtro por ano.
- Ensino Fundamental aceita etapas de ano único entre o 1º e o 9º ano e etapas
  que abrangem faixas dentro desse intervalo; Ensino Médio aceita etapas de ano
  único ou faixas dentro do 1º ao 3º ano.
- Uma etapa informada para um nível diferente é entrada inválida, não resultado
  vazio.
- Um filtro válido sem habilidades correspondentes produz resultado vazio claro.
- Uma busca válida por código ou texto sem correspondência produz resultado vazio
  claro, inclusive quando combinada com filtros válidos.
- Código de habilidade duplicado não cria nem sobrescreve item existente.
- Uma tentativa de alterar o código de uma habilidade existente é rejeitada sem
  modificar a habilidade.
- Habilidades desativadas não são retornadas a professores, mas continuam
  identificáveis para a gestão administrativa autorizada.
- Nível ou etapa desativado oculta toda a cadeia descendente para PROFESSOR; sua
  reativação não reativa descendentes desativados individualmente.
- Uma solicitação sem autenticação ou com papel insuficiente não retorna dados ou
  permite alteração fora de sua permissão.

## Requisitos *(obrigatório)*

### Requisitos Funcionais

- **FR-001**: O sistema DEVE exigir autenticação para consultar ou administrar o
  catálogo BNCC de Computação.
- **FR-002**: O sistema DEVE permitir que PROFESSOR autenticado consulte as
  habilidades ativas do catálogo, sem poder criar, editar ou desativar itens.
- **FR-003**: O sistema DEVE permitir que ADMIN autenticado crie, edite e
  desative níveis de ensino, etapas de ensino e habilidades BNCC. Um nível criado
  DEVE corresponder a um dos três níveis canônicos definidos nesta feature e só
  pode ser criado se esse nível ainda não existir no catálogo.
- **FR-004**: O backend DEVE aplicar a distinção entre PROFESSOR e ADMIN para
  todas as ações de administração, independentemente da interface.
- **FR-005**: O sistema DEVE organizar cada Etapa de Ensino sob exatamente um
  Nível de Ensino; uma etapa pode representar um ano único ou uma faixa de anos
  dentro de seu nível.
- **FR-006**: O sistema DEVE reconhecer Educação Infantil como nível sem recorte
  por ano; Ensino Fundamental com etapas de ano único ou faixas entre o 1º e o
  9º ano; e Ensino Médio com etapas de ano único ou faixas entre o 1º e o 3º ano.
- **FR-007**: O sistema DEVE permitir filtros combináveis por nível de ensino,
  etapa/ano e eixo, retornando somente habilidades que atendam a todos os filtros
  fornecidos.
- **FR-008**: Uma Habilidade BNCC PODE permanecer com eixo pendente de
  classificação. Quando classificada, DEVE aceitar somente Pensamento
  Computacional, Mundo Digital ou Cultura Digital; filtros por eixo não retornam
  habilidades pendentes.
- **FR-009**: O sistema DEVE rejeitar filtros inválidos, inclusive eixo não
  permitido, etapa incompatível com o nível selecionado, ano não contemplado por
  uma etapa e ano para Educação Infantil, com mensagem que permita corrigir a
  entrada.
- **FR-010**: O sistema DEVE apresentar um estado de resultado vazio distinto de
  erro de validação quando filtros válidos não encontrarem habilidades ativas.
- **FR-011**: Cada Habilidade BNCC DEVE pertencer a uma Etapa de Ensino, possuir
  código globalmente único e imutável após a criação, descrição, explicação e ao
  menos um exemplo. Seu eixo pode permanecer pendente ou, quando classificado,
  ser exatamente um dos três valores válidos. Cada habilidade pode reunir vários
  exemplos ordenados.
- **FR-012**: O sistema DEVE impedir que uma etapa pertença a mais de um nível e
  que duas habilidades compartilhem o mesmo código.
- **FR-013**: O sistema DEVE excluir habilidades desativadas das consultas feitas
  por PROFESSOR, preservando-as para administração autorizada. Nível ou etapa
  desativado DEVE ocultar suas habilidades descendentes ao PROFESSOR; reativar o
  ancestral não DEVE reativar descendente desativado individualmente.
- **FR-014**: O catálogo BNCC DEVE ser global; nenhum item do catálogo pode ser
  criado, alterado ou desativado em nome de um professor específico.
- **FR-015**: O sistema DEVE permitir busca por código BNCC completo ou parcial e
  por texto da descrição, explicação ou exemplos da habilidade. A busca DEVE ser
  combinável com os filtros definidos nesta feature.
- **FR-016**: O sistema DEVE apresentar resultados de consulta em páginas, em
  ordem crescente de código BNCC. Consulta de página além do total DEVE retornar
  lista vazia e metadados do total, sem ser tratada como entrada inválida. O tamanho
  da página será definido no planejamento sem alterar esse comportamento.
- **FR-017**: O sistema DEVE registrar de forma auditável a criação, edição e
  desativação administrativa de níveis, etapas e habilidades, sem incluir tokens,
  segredos ou conteúdo de credenciais.

### Entidades Principais

- **Nível de Ensino**: Agrupamento educacional do catálogo, como Educação
  Infantil, Ensino Fundamental ou Ensino Médio; possui etapas de ensino.
- **Etapa de Ensino**: Etapa pertencente a exatamente um nível; representa um
  ano único ou uma faixa de anos adotada pelo produto, quando aplicável ao nível.
- **Habilidade BNCC**: Habilidade global do catálogo de Computação, vinculada a
  uma etapa, identificada por código único e descrita por eixo pendente ou por
  exatamente um eixo válido, descrição, explicação e ao menos um exemplo
  ordenado; pode estar ativa ou desativada.

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **SC-001**: Em testes de aceitação, 100% dos professores autenticados localizam
  uma habilidade conhecida usando uma combinação válida de nível, etapa/ano e
  eixo em até dois minutos.
- **SC-002**: Em testes de aceitação, 100% das combinações de filtros inválidas
  recebem orientação de correção e não são apresentadas como resultado vazio.
- **SC-003**: Em testes de aceitação, 100% das consultas com filtros válidos sem
  correspondência apresentam estado de resultado vazio compreensível.
- **SC-004**: Em testes de autorização, 100% das tentativas de PROFESSOR de criar,
  editar ou desativar itens do catálogo são negadas pelo backend.
- **SC-005**: Em testes de aceitação, 100% das habilidades desativadas deixam de
  aparecer nas consultas de PROFESSOR, enquanto permanecem visíveis à gestão
  administrativa autorizada.
- **SC-006**: Em testes de integridade, 100% das tentativas de duplicar código de
  habilidade, associar uma etapa a nível incompatível ou informar ano fora da
  etapa são rejeitadas sem alterar o catálogo.
- **SC-007**: Em testes de aceitação, 100% das buscas conhecidas por código
  completo, parte de código ou texto retornam a habilidade esperada quando
  combinadas com filtros compatíveis.
- **SC-008**: Em ambiente de aceitação com catálogo seedado, pelo menos 95% de
  vinte consultas representativas por filtros e busca retornam sua página em até
  um segundo.

## Premissas

- A autenticação e os papéis ADMIN e PROFESSOR definidos pela Feature 001 estão
  disponíveis para esta feature.
- O catálogo desta feature abrange somente Computação e é global, não havendo
  catálogo particular por professor, escola ou turma.
- Educação Infantil pode possuir etapas próprias no produto, mas nenhuma delas
  representa ano neste recorte. Nos demais níveis, uma etapa pode corresponder a
  ano único ou faixa de anos, preservando recortes presentes no material BNCC.
- A desativação preserva o item para administração autorizada e o remove da
  consulta docente; exclusão definitiva não faz parte desta feature.
- Esta specification define resultados e regras de negócio, não decide tabelas,
  índices, DTOs, componentes de interface ou escolhas de implementação.
- O tamanho da página e os controles de navegação serão definidos no planejamento;
  a ordenação crescente por código e a combinação de busca com filtros são regras
  desta specification.
- A administração de níveis limita-se aos três níveis canônicos desta feature;
  acrescentar novo nível educacional é mudança de escopo e requer nova specification.
