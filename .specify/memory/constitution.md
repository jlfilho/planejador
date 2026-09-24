# Constituição do Planejador BNCC

## Princípios Fundamentais

### I. Segurança por Padrão

Toda entrada DEVE ser validada. A autenticação DEVE usar mecanismos seguros; o
backend DEVE aplicar RBAC e verificar propriedade para todo recurso privado,
independentemente da interface. Segredos, credenciais, chaves de integração e
chaves privadas NUNCA DEVEM ser expostos, versionados ou devolvidos ao navegador.
Os segredos de integração DEVEM permanecer no backend ou em um cofre aprovado.

### II. Entrega Orientada por Especificação

Toda alteração funcional DEVE começar em uma specification numerada e seguir o
fluxo Specify, Clarify, Plan, Checklist, Tasks, Analyze, Implement e Converge.
Cada feature DEVE ter exatamente uma specification, uma branch
`feat/<numero>-<nome>` e um pull request. A branch da feature DEVE ser criada
automaticamente imediatamente antes de Implement.

### III. Dados Autoritativos e API Contratual

O PostgreSQL acessado por meio do Prisma é o repositório persistente autoritativo,
e toda alteração de esquema DEVE usar migrations versionadas. O catálogo da BNCC é
global e somente leitura para professores. A API DEVE ser RESTful e documentada em
OpenAPI/Swagger; o frontend NÃO DEVE acessar diretamente o banco de dados, n8n,
Gemini ou Qdrant.

### IV. IA Responsável com Autoria Humana

Todo resultado produzido por IA DEVE começar como rascunho editável. A autoria e o
controle humanos DEVEM ser preservados, e o sistema NÃO DEVE finalizar
automaticamente um resultado de IA. Integrações de IA DEVEM ser chamadas apenas
por meio de limites aprovados do backend.

### V. Qualidade Verificável

Testes unitários, de integração e de ponta a ponta críticos DEVEM ser mantidos.
Lint, verificação de tipos e builds de produção DEVEM passar antes da abertura de
um pull request. Uma barreira de qualidade reprovada bloqueia a publicação até sua
resolução.

## Limites de Arquitetura e Dados

Dados privados pertencem ao seu usuário proprietário. O backend DEVE verificar a
propriedade em toda leitura, escrita, atualização, exclusão ou operação que afete
dados privados. Visibilidade no cliente, guardas de rota e restrições da UI são
apenas controles de conveniência e NÃO DEVEM substituir a autorização no backend.
O acesso a integrações externas é mediado por serviços de backend que validam
requisições, protegem segredos e retornam somente os dados apropriados ao usuário
autenticado.

## Fluxo de Entrega e Barreiras de Qualidade

O trabalho avança em incrementos pequenos e revisáveis. A implementação DEVE usar
a specification numerada ativa e seu plano e tarefas gerados. Antes da publicação,
o fluxo da feature DEVE inspecionar as alterações propostas, rejeitar arquivos
inesperados ou sensíveis, executar as barreiras de qualidade disponíveis e criar
um PR direcionado a `main`. A aprovação do merge permanece uma decisão humana.

## Governança

Esta constituição prevalece sobre práticas conflitantes do projeto. Toda emenda
DEVE ser documentada em `.specify/memory/constitution.md`, incluir um Relatório de
Impacto de Sincronização e seguir versionamento semântico: MAJOR para alterações
de governança incompatíveis, MINOR para princípios novos ou materialmente
ampliados e PATCH para esclarecimentos. As revisões de pull request DEVEM verificar
a conformidade com estes princípios, especialmente segurança, propriedade, limites
da API, revisabilidade da IA e barreiras de qualidade.

**Versão**: 1.0.1 | **Ratificada em**: 2026-09-23 | **Última alteração**: 2026-09-23
