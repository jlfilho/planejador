# Modelo de Dados: Alinhamento da UI ao Figma

## Alterações de persistência

Nenhuma. A Feature 004 é exclusivamente visual e não cria, altera ou remove
entidades, atributos, relações, índices, migrations ou contratos de persistência.

## Dados consumidos pela UI

| Origem existente | Uso preservado |
|---|---|
| Sessão autenticada | Determina a disponibilidade de ações e protege chamadas à API. |
| Catálogo BNCC | Alimenta filtros, resultados e formulários administrativos já existentes. |
| Respostas de erro e carregamento | Alimentam os estados visuais das telas. |

Os dados continuam pertencendo aos recursos e usuários definidos pelas Features
001 e 002. A mudança de aparência não amplia leitura, escrita, RBAC ou ownership.
