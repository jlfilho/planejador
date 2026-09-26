# Especificação da Feature: Fundação e autenticação

**Branch da Feature**: `feat/001-foundation-auth`

**Criada em**: 2026-09-23

**Status**: Rascunho

**Entrada**: Descrição do usuário: "Foundation e autenticação do Planejador BNCC."

## Clarificações

### Sessão 2026-09-23

- P: Como a primeira conta ADMIN deve ser criada? → R: Um operador autorizado
  provisiona a primeira conta ADMIN fora do cadastro público.
- P: Qual papel deve receber uma conta criada pelo cadastro público? → R: Toda conta
  criada pelo cadastro público recebe PROFESSOR.
- P: Como as sessões devem funcionar quando o mesmo usuário acessa vários dispositivos?
  → R: Múltiplas sessões são permitidas; logout invalida somente a sessão atual.

## Cenários de Usuário e Testes *(obrigatório)*

### História de Usuário 1 - Criar conta e entrar (Prioridade: P1)

Como professor, quero criar uma conta com meu e-mail e senha e entrar no sistema
para acessar recursos privados do Planejador BNCC.

**Por que esta prioridade**: Sem uma identidade autenticada, professores não
podem usar com segurança nenhuma funcionalidade privada da aplicação.

**Teste independente**: Um novo professor cria uma conta válida, entra com suas
credenciais e alcança uma área privada sem depender das demais histórias.

**Cenários de aceitação**:

1. **Dado** que não existe uma conta para um e-mail válido, **Quando** o professor
   cria uma conta com uma senha válida, **Então** a conta é criada e o professor
   recebe o papel PROFESSOR e pode iniciar uma sessão segura.
2. **Dado** que já existe uma conta para o e-mail informado, **Quando** alguém
   tenta criar outra conta, **Então** o sistema rejeita a duplicidade sem criar
   uma segunda conta.
3. **Dado** que o professor possui uma conta ativa, **Quando** informa credenciais
   válidas, **Então** o sistema inicia uma sessão segura.
4. **Dado** que uma conta está inativa ou as credenciais são inválidas, **Quando**
   ocorre uma tentativa de entrada, **Então** o sistema nega o acesso com uma
   mensagem que não revela se a conta existe.

---

### História de Usuário 2 - Manter o ciclo de sessão (Prioridade: P1)

Como professor autenticado, quero usar o sistema em vários dispositivos, encerrar
uma sessão específica e renovar o acesso após ela expirar para controlar com
segurança quando posso acessar dados privados.

**Por que esta prioridade**: O usuário precisa encerrar o acesso em dispositivos
compartilhados e retomar o trabalho após expiração sem expor dados privados.

**Teste independente**: Um professor autenticado encerra uma sessão e comprova que
ela não serve mais para recursos privados; depois, com credenciais válidas, retoma
o acesso após a expiração.

**Cenários de aceitação**:

1. **Dado** que o professor possui sessões ativas em mais de um dispositivo,
   **Quando** solicita logout em um deles, **Então** somente a sessão correspondente
   é invalidada e as demais sessões ativas permanecem válidas.
2. **Dado** que a credencial temporária de acesso expirou, mas a sessão e sua
   credencial de renovação ainda são válidas, **Quando** o professor solicita
   renovação, **Então** recebe uma nova credencial de acesso sem reutilizar a
   credencial de renovação anterior.
3. **Dado** que a sessão ou sua credencial de renovação expirou ou foi invalidada,
   **Quando** o professor solicita renovação, **Então** a renovação é negada e uma
   nova sessão exige nova autenticação com credenciais válidas.
4. **Dado** que uma sessão foi invalidada ou expirou, **Quando** ela é apresentada
   a uma rota privada, **Então** o acesso é negado sem exposição de dados privados.

---

### História de Usuário 3 - Aplicar papéis e propriedade (Prioridade: P2)

Como administrador, quero que minha conta seja reconhecida como ADMIN e que contas
docentes sejam reconhecidas como PROFESSOR, para que o sistema aplique permissões
de forma consistente.

**Por que esta prioridade**: Papéis e propriedade são a base para proteger dados
privados conforme a constituição do projeto.

**Teste independente**: Para contas com papéis distintos, uma tentativa de acessar
um recurso protegido confirma que o backend aplica autorização e propriedade, sem
depender de elementos visíveis no frontend.

**Cenários de aceitação**:

1. **Dado** que uma conta administrativa autenticada acessa uma ação administrativa,
   **Quando** sua autorização é verificada, **Então** o sistema a reconhece como ADMIN.
2. **Dado** que uma conta docente autenticada acessa uma ação privada permitida,
   **Quando** sua autorização é verificada, **Então** o sistema a reconhece como PROFESSOR.
3. **Dado** que um usuário tenta acessar recurso privado de outro proprietário ou
   uma ação sem o papel exigido, **Quando** a solicitação chega ao backend, **Então**
   o acesso é negado mesmo que a interface exiba ou oculte controles de forma incorreta.
4. **Dado** que uma conta ADMIN autenticada altera o estado de uma conta, **Quando**
   a operação é autorizada, **Então** o estado ativo ou inativo é atualizado, as
   sessões futuras da conta inativa são negadas e a mudança é auditável.
5. **Dado** que uma conta sem o papel ADMIN tenta alterar o estado de outra conta,
   **Quando** a solicitação chega ao backend, **Então** a operação é negada.
6. **Dado** que uma alteração inativaria a própria conta ADMIN autenticada ou o
   último ADMIN ativo, **Quando** a solicitação é recebida, **Então** o sistema a
   rejeita sem alterar o estado da conta-alvo.

---

### História de Usuário 4 - Auditar eventos de autenticação (Prioridade: P2)

Como administrador responsável pelo sistema, quero que eventos relevantes de
autenticação sejam auditáveis para investigar incidentes e acompanhar o uso seguro.

**Por que esta prioridade**: A auditabilidade apoia segurança, resposta a incidentes
e responsabilidade operacional sem expor segredos.

**Teste independente**: Após eventos de criação de conta, entrada, saída, expiração,
renovação, ativação ou inativação, uma revisão autorizada confirma registros de
auditoria suficientes para identificar o evento e seu resultado, sem incluir senhas.

**Cenários de aceitação**:

1. **Dado** que ocorre um evento relevante de autenticação, **Quando** ele termina,
   **Então** o sistema registra um evento auditável com seu resultado.
2. **Dado** que ocorre uma tentativa de entrada falha, **Quando** o evento é auditado,
   **Então** o registro não contém senha nem outro segredo recuperável.

### Casos de Borda

- Uma tentativa de cadastro com e-mail já utilizado não cria uma segunda conta.
- Tentativas repetidas de entrada com credenciais inválidas não revelam se o e-mail
  corresponde a uma conta existente.
- O logout de uma sessão não invalida indevidamente outras sessões do mesmo usuário.
- Uma conta inativa não inicia nem renova uma sessão.
- Uma credencial temporária de acesso expirada só pode ser renovada por sessão ativa
  com credencial de renovação válida; sessão expirada ou invalidada exige nova
  autenticação e não dá acesso a dados privados.
- Registros de auditoria não incluem senhas, segredos ou credenciais reutilizáveis.

## Requisitos *(obrigatório)*

### Requisitos Funcionais

- **FR-001**: O sistema DEVE permitir que um professor crie uma conta usando e-mail
  único e senha válida; toda conta criada pelo cadastro público DEVE receber o
  papel PROFESSOR.
- **FR-002**: O sistema DEVE impedir a criação de mais de uma conta para o mesmo
  e-mail.
- **FR-003**: O sistema DEVE armazenar a senha de modo que ela nunca seja recuperável
  em texto.
- **FR-004**: O sistema DEVE manter, para cada conta, estado ativo ou inativo e papel
  ADMIN ou PROFESSOR. A primeira conta ADMIN DEVE ser provisionada por um operador
  autorizado fora do cadastro público.
- **FR-005**: O sistema DEVE permitir entrada somente para conta ativa com credenciais
  válidas e criar uma sessão segura após a entrada bem-sucedida.
- **FR-006**: O sistema DEVE negar entrada e renovação para contas inativas, sem
  revelar indevidamente se a conta ou o e-mail informado existe.
- **FR-007**: O sistema DEVE permitir a renovação da credencial temporária de acesso
  somente quando a sessão e sua credencial de renovação estiverem válidas, sem
  reutilizar a credencial de renovação anterior. Sessão ou credencial de renovação
  expirada ou invalidada DEVE exigir nova autenticação com credenciais válidas.
- **FR-008**: O sistema DEVE permitir múltiplas sessões ativas para a mesma conta e
  invalidar somente a sessão correspondente quando o usuário solicitar logout.
- **FR-009**: O sistema DEVE exigir autenticação para rotas privadas e negar acesso
  quando a sessão estiver ausente, expirada ou invalidada.
- **FR-010**: O backend DEVE aplicar RBAC e verificar propriedade para todo recurso
  privado, independentemente de controles ou ocultações no frontend.
- **FR-011**: O sistema DEVE retornar falhas de autenticação sem informar se um e-mail
  ou conta específica existe, salvo a informações já autorizadas ao usuário autenticado.
- **FR-012**: O sistema DEVE registrar de forma auditável criação de conta, entradas,
  falhas de entrada, logout, expiração, renovação e mudanças de estado da conta,
  sem registrar senhas ou segredos reutilizáveis.
- **FR-013**: O sistema DEVE permitir somente a uma conta ADMIN autenticada alterar
  o estado ativo ou inativo de uma conta. Após a inativação, o sistema DEVE negar
  novas entradas e renovações dessa conta. O sistema DEVE impedir a inativação da
  própria conta ADMIN autenticada e garantir que permaneça pelo menos uma conta
  ADMIN ativa.

### Entidades Principais

- **Conta de usuário**: Identidade de uma pessoa no sistema, com e-mail único, estado
  ativo ou inativo e papel ADMIN ou PROFESSOR; sua senha não pode ser recuperada em
  texto.
- **Sessão**: Permissão temporal associada a uma conta autenticada, que pode estar
  ativa, expirada ou invalidada; uma conta pode possuir múltiplas sessões ativas
  independentes.
- **Evento de auditoria de autenticação**: Registro de um evento relevante de
  autenticação, seu resultado e contexto necessário à investigação autorizada, sem
  segredos recuperáveis.

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **SC-001**: Em testes de aceitação, 100% dos novos professores com dados válidos
  concluem criação de conta e entrada em até dois minutos.
- **SC-002**: Em testes de aceitação, 100% das tentativas de uso de sessão ausente,
  expirada ou invalidada em rotas privadas são negadas sem retornar dados privados.
- **SC-003**: Em testes de aceitação, 100% das tentativas de login com e-mail
  inexistente, senha incorreta ou conta inativa retornam a mesma categoria de erro
  público.
- **SC-004**: Em testes de aceitação, 100% dos eventos relevantes de autenticação
  definidos nesta specification possuem registro de auditoria sem senhas ou segredos.
- **SC-005**: Em uma revisão de autorização, 100% das ações privadas exercitadas por
  papéis ou proprietários não autorizados são negadas pelo backend.

## Premissas

- Cadastro por e-mail e senha é o meio inicial de criação de conta; provedores externos
  de identidade não fazem parte desta feature, e esse cadastro cria contas PROFESSOR.
- Um operador autorizado do projeto provisiona a primeira conta ADMIN fora do cadastro
  público; exceto pela alteração de estado ativo/inativo prevista nesta feature, a
  administração completa de usuários está fora do escopo.
- A expiração da credencial temporária de acesso permite renovação somente por uma
  sessão ativa com credencial de renovação válida; após expiração ou invalidação da
  sessão ou dessa credencial, uma nova sessão exige autenticação com e-mail e senha.
  O mecanismo e as durações das credenciais serão definidos no planejamento.
- Esta specification não decide bibliotecas, tabelas, algoritmo de hash, formato ou
  duração de credenciais de sessão.
- Recuperação ou redefinição de senha, alteração de perfil e gestão completa de
  usuários são funcionalidades futuras, salvo quando estritamente necessárias para
  cumprir os requisitos acima.
