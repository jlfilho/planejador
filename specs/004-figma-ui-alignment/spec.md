# Especificação da Feature: Alinhamento da UI ao Figma

**Branch da Feature**: `feat/004-figma-ui-alignment`

**Criada em**: 2026-09-28

**Status**: Rascunho

**Entrada**: Descrição do usuário: "As telas de UI devem ser atualizadas para corresponder ao design do Figma utilizando MCP."

## Clarifications

### Session 2026-09-28

- Q: Quando o Figma mostrar textos, exemplos ou dados de demonstração diferentes dos dados reais da aplicação, qual fonte deve prevalecer? → A: Preservar conteúdo e comportamento atuais; aplicar apenas a apresentação do Figma.
- Q: Quais tamanhos de tela devem estar no escopo da atualização visual? → A: Desktop e mobile, mesmo que o Figma apresente apenas uma variante.
- Q: Se uma divergência necessária entre a tela e o Figma for identificada, quando ela pode ser aceita? → A: Somente após registro e aprovação humana da divergência.

## Cenários de Usuário e Testes *(obrigatório)*

### História de Usuário 1 - Utilizar telas alinhadas ao design (Prioridade: P1)

Como usuário autenticado do Planejador BNCC, quero utilizar as telas existentes
com apresentação, componentes e estados alinhados ao design aprovado no Figma,
para executar minhas tarefas com uma experiência visual consistente.

**Por que esta prioridade**: A fidelidade ao design aprovado é o valor central
desta feature e abrange as telas atuais incluídas no escopo de referência.

**Teste independente**: Para cada tela coberta pelo design de referência, um
revisor compara a interface renderizada ao respectivo layout aprovado e confirma
que componentes, conteúdo e ações permanecem disponíveis.

**Cenários de aceitação**:

1. **Dado** que existe um layout aprovado para uma tela atual, **Quando** o
   usuário a abre, **Então** a tela apresenta a hierarquia, os componentes e os
   elementos visuais definidos para ela no design de referência.
2. **Dado** que uma tela atual possui ações disponíveis, **Quando** sua
   apresentação é atualizada, **Então** o usuário continua conseguindo executar
   as mesmas ações autorizadas.
3. **Dado** que o usuário acessa uma tela coberta em desktop ou mobile, **Quando**
   a interface é apresentada, **Então** a hierarquia visual e as ações
   permanecem compreensíveis e utilizáveis.

---

### História de Usuário 2 - Compreender estados da interface (Prioridade: P2)

Como usuário, quero receber estados visuais claros durante carregamento, ausência
de dados ou erro nas telas cobertas, para saber o que está acontecendo e como
prosseguir.

**Por que esta prioridade**: Estados claros evitam que a atualização visual
reduza a compreensão do fluxo existente.

**Teste independente**: Um revisor simula carregamento, resultado vazio e erro
em cada tela coberta que os possua e confirma a apresentação definida no design.

**Cenários de aceitação**:

1. **Dado** que uma tela coberta está carregando dados, **Quando** o usuário a
   consulta, **Então** recebe o estado de carregamento previsto no design.
2. **Dado** que uma tela coberta não possui dados ou encontra erro, **Quando** o
   usuário a consulta, **Então** recebe uma mensagem e ação de recuperação
   compatíveis com o design e com o fluxo existente.

### Casos de Borda

- Uma tela atual sem layout correspondente não recebe uma alteração visual
  inventada; sua inclusão depende de decisão de escopo.
- Se o design de referência não definir um estado de carregamento, vazio ou
  erro, o estado atual compreensível é preservado até haver definição aprovada.
- Uma adaptação visual não pode expor conteúdo privado, alterar permissões nem
  remover uma ação que continue autorizada.
- Elementos do design sem equivalência funcional no produto não criam novas
  funcionalidades nesta feature.
- Textos de demonstração e dados de exemplo do Figma não substituem conteúdo
  funcional, dados reais ou regras atuais do produto.
- Quando o Figma apresentar uma única variante, a apresentação no outro tamanho
  de tela preserva sua hierarquia visual e funcionalidade sem inventar novos
  fluxos.

## Requisitos *(obrigatório)*

### Requisitos Funcionais

- **FR-001**: A feature DEVE usar como referência um arquivo ou conjunto de
  layouts Figma identificado e acessível pela integração MCP disponível.
- **FR-002**: O sistema DEVE atualizar somente as telas atuais explicitamente
  cobertas pelo design de referência aprovado.
- **FR-003**: Cada tela atual coberta DEVE refletir a hierarquia visual,
  componentes, textos, estados e elementos gráficos definidos no seu layout de
  referência.
- **FR-004**: A atualização visual DEVE preservar as ações, dados, autenticação,
  RBAC e verificações de ownership existentes.
- **FR-005**: As telas cobertas DEVEM apresentar estados claros de carregamento,
  vazio e erro quando esses estados estiverem definidos no design de referência.
- **FR-006**: A feature NÃO DEVE criar telas, fluxos, permissões ou integrações
  novas que não estejam presentes no produto e no design de referência.
- **FR-007**: A equipe DEVE registrar toda divergência inevitável entre a tela
  implementada e o design de referência e obter sua aprovação humana antes da
  conclusão da feature.
- **FR-008**: O sistema DEVE usar como fonte de verdade o arquivo Figma
  [Planejador BNCC](https://www.figma.com/design/s7PdK3pJkHRj6FGNTvJ4vG/Planejador-BNCC?node-id=0-1&m=dev&t=hgIavDyMtZZTZ2hj-1), acessível pela integração MCP, para atualizar todas as
  telas atuais do produto.
- **FR-009**: O sistema DEVE usar o Figma como referência de apresentação, sem
  substituir textos funcionais, dados reais, permissões ou comportamentos atuais.
- **FR-010**: As telas atuais DEVEM permanecer utilizáveis em desktop e mobile;
  quando o Figma não definir uma variante, a adaptação DEVE preservar sua
  hierarquia visual e as ações existentes.

### Entidades Principais

- **Tela coberta**: Tela atual do produto que possui layout correspondente no
  design de referência e é incluída no escopo da atualização.
- **Design de referência**: Layout aprovado no Figma que define a aparência e
  os estados esperados de uma tela coberta.
- **Divergência de design**: Diferença necessária e documentada entre uma tela
  implementada e seu layout de referência.

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **SC-001**: 100% das telas identificadas no escopo possuem revisão visual
  documentada contra seu layout de referência antes da entrega.
- **SC-002**: 100% das ações previamente autorizadas nas telas cobertas continuam
  disponíveis após a atualização visual.
- **SC-003**: Em revisão de cada tela coberta, os estados de carregamento, vazio
  e erro definidos no design são reconhecíveis pelo revisor.
- **SC-004**: 100% das divergências necessárias em relação ao design são
  documentadas e aprovadas por uma pessoa responsável antes da conclusão da
  feature.
- **SC-005**: 100% das telas cobertas são revisadas em desktop e mobile antes da
  entrega.

## Premissas

- O arquivo Figma informado está acessível pela integração MCP e cobre todas as
  telas atuais do produto.
- Esta feature atualiza a apresentação de telas existentes, não cria novos
  fluxos de negócio.
- A referência visual não substitui requisitos existentes de segurança,
  autorização, ownership ou tratamento de erros.
