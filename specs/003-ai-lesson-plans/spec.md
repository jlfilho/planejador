# Especificação da Feature: Gerador de planos de aula por IA

**Branch da Feature**: `feat/003-ai-lesson-plans`

**Criada em**: 2026-09-27

**Status**: Rascunho

**Entrada**: Descrição do usuário: "Professor autenticado gera um plano de aula editável a partir de habilidades BNCC, instrução pedagógica, duração e uso de recursos digitais, com assistência de IA mediada pela aplicação."

## Clarifications

### Session 2026-09-27

- Q: Quando o professor solicitar uma nova geração após já existir um rascunho, como os planos devem ser tratados? → A: Criar um novo rascunho independente e manter o rascunho anterior inalterado.
- Q: Após uma falha de geração, como o professor deve iniciar uma nova tentativa? → A: Voltar ao formulário de envio com os campos já preenchidos; uma nova solicitação é iniciada manualmente.
- Q: Como as referências retornadas pela geração devem permanecer associadas ao plano? → A: Permanecem no plano, visíveis e editáveis pelo professor junto ao rascunho.
- Q: Qual escopo pedagógico um plano gerado deve cobrir? → A: Uma única aula.
- Q: Depois de finalizar um plano, como o professor deve poder alterar seu conteúdo? → A: O plano finalizado não pode mais ser editado.
- Q: Um ADMIN deve poder acessar planos de aula privados de outros professores? → A: Sim, para consultar e alterar, respeitando as restrições de estado do plano.
- Q: Após uma geração bem-sucedida, como os dados de entrada enviados devem permanecer associados ao plano? → A: Ficam salvos com o plano como registro original, sem edição.
- Q: Quais campos o professor deve obrigatoriamente preencher antes de solicitar a geração do plano? → A: Uma ou mais habilidades BNCC, instrução pedagógica, duração da aula e indicação de uso de recursos digitais; estes campos substituem nível, etapa e contexto em texto livre.
- Q: Se o professor e um ADMIN tentarem salvar alterações no mesmo rascunho ao mesmo tempo, como o sistema deve agir? → A: Aceitar o último salvamento recebido.

## Cenários de Usuário e Testes *(obrigatório)*

### História de Usuário 1 - Gerar rascunho de plano (Prioridade: P1)

Como professor autenticado, quero selecionar uma ou mais habilidades BNCC e
informar instrução pedagógica, duração da aula e uso de recursos digitais para
solicitar um plano de uma única aula em Markdown, para iniciar meu planejamento
com um rascunho pertinente.

**Por que esta prioridade**: A geração de um rascunho editável é o valor central
da feature e reduz o tempo de elaboração inicial sem retirar a autoria docente.

**Teste independente**: Um professor autenticado escolhe habilidades BNCC
válidas, informa a instrução, duração e uso de recursos digitais, solicita a
geração e recebe um plano em Markdown marcado como RASCUNHO e auxiliado por IA.

**Cenários de aceitação**:

1. **Dado** que o professor está autenticado e seleciona ao menos uma habilidade
   BNCC válida, **Quando** informa instrução pedagógica, duração positiva da
   aula e se usará recursos digitais e solicita a geração, **Então** recebe um
   plano em Markdown como RASCUNHO.
2. **Dado** que o rascunho foi gerado, **Quando** o professor o consulta,
   **Então** o plano preserva as habilidades BNCC selecionadas e informa de
   forma visível que foi auxiliado por IA, incluindo as referências retornadas
   pela geração para revisão e edição.
3. **Dado** que o professor omite um campo obrigatório ou seleciona habilidade
   BNCC inválida, **Quando** solicita a geração, **Então** recebe orientação
   para corrigir a entrada e nenhum plano é criado.

---

### História de Usuário 2 - Revisar e decidir o destino do plano (Prioridade: P1)

Como professor autenticado, quero revisar e editar o conteúdo do rascunho antes
de salvá-lo ou finalizá-lo, para manter controle e autoria sobre o plano de aula.

**Por que esta prioridade**: A IA só é assistiva se o professor puder revisar e
alterar todo conteúdo antes de tomar uma decisão explícita sobre o plano.

**Teste independente**: Após receber um rascunho, o professor altera o Markdown,
salva o rascunho e finaliza o plano somente por ação explícita.

**Cenários de aceitação**:

1. **Dado** que um professor possui um plano em RASCUNHO, **Quando** edita seu
   Markdown e o salva, **Então** o conteúdo revisado permanece associado ao
   mesmo professor e continua identificável como rascunho até finalização
   explícita.
2. **Dado** que um professor revisou um rascunho, **Quando** escolhe finalizá-lo
   explicitamente, **Então** o plano é marcado como finalizado sem que a IA o
   tenha finalizado automaticamente.
3. **Dado** que outro professor tenta consultar, editar, salvar ou finalizar um
   plano que não lhe pertence, **Quando** a solicitação chega ao sistema,
   **Então** o acesso é negado sem devolver o conteúdo privado.
4. **Dado** que um professor possui um plano finalizado, **Quando** tenta
   editá-lo ou salvá-lo, **Então** o sistema recusa a alteração e preserva o
   conteúdo finalizado.
5. **Dado** que um ADMIN acessa um plano de outro professor, **Quando** consulta
   ou altera um rascunho, **Então** o sistema autoriza a ação no backend e a
   registra de forma auditável sem alterar a propriedade do plano.
6. **Dado** que o professor e um ADMIN salvam alterações concorrentes no mesmo
   rascunho, **Quando** ambos os salvamentos são recebidos, **Então** o último
   salvamento recebido prevalece.

---

### História de Usuário 3 - Lidar com falha de geração (Prioridade: P2)

Como professor autenticado, quero receber uma mensagem clara se a geração não
puder ser concluída, para decidir se tento novamente sem perder controle sobre
meu planejamento.

**Por que esta prioridade**: Falhas do serviço de geração não podem produzir ou
publicar um plano parcial que pareça confiável.

**Teste independente**: Uma solicitação de geração cuja resposta é indisponível,
expira, falha ou é inválida termina com orientação ao professor e sem plano
parcial salvo ou finalizado.

**Cenários de aceitação**:

1. **Dado** que o serviço de geração está indisponível, demora além do limite
   aceito, falha ou devolve conteúdo inválido, **Quando** o professor solicita
   um plano, **Então** o sistema informa que a geração não foi concluída e não
   publica nem finaliza conteúdo parcial.
2. **Dado** que a geração falhou, **Quando** o professor consulta seus planos,
   **Então** não encontra um novo plano gerado parcialmente por essa tentativa.
3. **Dado** que a geração foi concluída com conteúdo válido, **Quando** o
   professor recebe o resultado, **Então** somente ele pode acessá-lo e revisá-lo.
4. **Dado** que a geração falhou, **Quando** o professor decide tentar de novo,
   **Então** retorna ao formulário com os dados enviados preservados e inicia
   manualmente uma nova solicitação.

### Casos de Borda

- A solicitação exige ao menos uma habilidade BNCC válida e ativa, instrução
  pedagógica, duração positiva e indicação de uso de recursos digitais.
- Markdown vazio, ausente ou inválido na resposta de geração não cria rascunho.
- Uma falha após o pedido de geração não pode deixar um plano parcial, publicado
  ou finalizado.
- A indicação de assistência por IA continua presente após edição, salvamento e
  finalização pelo professor.
- Um plano finalizado não pode ser editado nem salvo novamente.
- Em alterações concorrentes em um rascunho, o último salvamento recebido
  prevalece.
- Um professor só vê e altera planos de sua propriedade, mesmo que conheça seu
  identificador; ADMIN é a única exceção de RBAC para consulta e alteração de
  rascunhos de outros professores.
- O catálogo BNCC permanece global e somente leitura para professores; a feature
  não permite alterar habilidades por meio do fluxo de plano.

## Requisitos *(obrigatório)*

### Requisitos Funcionais

- **FR-001**: O sistema DEVE exigir autenticação para criar, consultar, editar,
  salvar ou finalizar planos de aula.
- **FR-002**: O sistema DEVE exigir, antes de solicitar uma geração, uma ou
  mais habilidades BNCC válidas e ativas, uma instrução pedagógica, uma duração
  positiva da aula e a indicação de uso de recursos digitais.
- **FR-003**: O sistema DEVE rejeitar habilidades BNCC inválidas, duração não
  positiva ou informações obrigatórias ausentes sem iniciar uma geração nem
  criar plano.
- **FR-004**: O sistema DEVE criar o resultado válido de uma geração somente
  como plano em estado RASCUNHO, em Markdown editável e associado ao professor
  solicitante.
- **FR-005**: Todo rascunho gerado DEVE preservar as habilidades BNCC escolhidas
  e informar que foi auxiliado por IA.
- **FR-006**: O professor DEVE poder editar o Markdown de um rascunho e salvá-lo
  antes de finalizá-lo.
- **FR-007**: O sistema DEVE finalizar um plano somente após ação explícita do
  professor proprietário; a geração por IA nunca pode finalizar um plano.
- **FR-008**: O sistema DEVE verificar no backend a propriedade do professor em
  toda leitura, edição, salvamento e finalização de um plano privado, exceto
  quando um ADMIN estiver autorizado a consultar ou alterar um rascunho de
  outro professor.
- **FR-009**: O frontend DEVE se comunicar somente com a API da aplicação e não
  pode acessar diretamente serviços externos de geração ou suas referências.
- **FR-010**: A aplicação DEVE solicitar a geração exclusivamente por meio do
  serviço externo de automação existente, que usa os recursos de IA e consulta
  necessários para compor o resultado.
- **FR-011**: Diante de indisponibilidade, tempo excedido, falha ou resposta
  inválida do serviço de geração, o sistema DEVE informar a não conclusão e não
  pode salvar, publicar ou finalizar plano parcial.
- **FR-012**: O sistema DEVE manter o catálogo BNCC como fonte global de
  habilidades e não permitir que este fluxo altere itens do catálogo.
- **FR-013**: O sistema DEVE registrar de forma auditável as ações relevantes de
  geração, edição, salvamento e finalização, sem registrar segredos, tokens ou
  conteúdo de credenciais.
- **FR-014**: Cada geração válida solicitada após já existir um rascunho DEVE
  criar um novo rascunho independente, sem sobrescrever nem alterar planos
  existentes do professor.
- **FR-015**: Após uma falha de geração, o sistema DEVE retornar o professor ao
  formulário com os dados enviados preservados; uma nova geração só pode ser
  iniciada por nova ação explícita do professor e não cria plano antes de obter
  resultado válido.
- **FR-016**: O sistema DEVE preservar com cada plano as referências retornadas
  pela geração, exibi-las ao professor proprietário e permitir que ele as edite
  enquanto revisa o rascunho.
- **FR-017**: Cada solicitação de geração DEVE produzir conteúdo para uma única
  aula; o fluxo não gera sequências de aulas.
- **FR-018**: O sistema DEVE recusar edição ou salvamento de plano finalizado;
  somente planos em RASCUNHO podem ser alterados.
- **FR-019**: O sistema DEVE permitir que ADMIN consulte e altere rascunhos de
  outros professores, sem transferir a propriedade do plano e registrando a
  identidade do ADMIN e a ação realizada em auditoria.
- **FR-020**: O sistema DEVE preservar com o plano os dados de entrada enviados
  na geração que o originou como registro original imutável.
- **FR-021**: Quando houver salvamentos concorrentes de um mesmo rascunho, o
  sistema DEVE manter o conteúdo do último salvamento recebido.

### Entidades Principais

- **Plano de Aula**: Conteúdo de planejamento em Markdown, com estado, indicação
  de assistência por IA, habilidades BNCC selecionadas, referências retornadas
  pela geração e um único professor proprietário.
- **Solicitação de Geração**: Pedido de um professor contendo habilidades BNCC
  selecionadas, instrução pedagógica, duração da aula e indicação de uso de
  recursos digitais, que pode resultar em um rascunho válido ou em falha sem
  plano parcial; em caso de sucesso, seus dados originais imutáveis permanecem
  associados ao plano.
- **Habilidade BNCC Selecionada**: Referência global e somente leitura usada
  para contextualizar um plano, preservada no resultado gerado.

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **SC-001**: Em testes de aceitação, 100% das solicitações válidas concluídas
  produzem um rascunho editável com as habilidades selecionadas e a indicação de
  assistência por IA.
- **SC-002**: Em testes de autorização, 100% das tentativas de outro professor
  de ler ou modificar plano privado são negadas sem retornar seu conteúdo.
- **SC-003**: Em testes de falha, 100% das indisponibilidades, tempos excedidos,
  falhas e respostas inválidas não produzem plano parcial, publicado ou
  finalizado.
- **SC-004**: Em testes de aceitação, 100% dos planos finalizados passaram por
  ação explícita do professor proprietário e nenhum foi finalizado
  automaticamente pela geração.
- **SC-005**: Em testes de usabilidade, pelo menos 90% dos professores de teste
  conseguem solicitar, revisar e salvar um rascunho em até cinco minutos.

## Premissas

- A autenticação, os papéis e o catálogo BNCC das Features 001 e 002 estão
  disponíveis.
- O serviço externo de automação e seus recursos de IA já existem e são
  acessíveis somente pela aplicação; a configuração de conexão será decidida no
  planejamento.
- Salvar mantém o plano em RASCUNHO; finalizar é uma ação posterior e explícita
  do professor proprietário.
- O escopo não inclui alterar o catálogo BNCC, compartilhar planos com outros
  professores, publicar planos automaticamente ou expor serviços externos ao
  frontend.
