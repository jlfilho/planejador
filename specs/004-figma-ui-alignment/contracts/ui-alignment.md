# Contrato de UI: Alinhamento ao Figma

## Referência de design

- Arquivo: [Planejador BNCC](https://www.figma.com/design/s7PdK3pJkHRj6FGNTvJ4vG/Planejador-BNCC?node-id=0-1&m=dev&t=hgIavDyMtZZTZ2hj-1)
- Fonte de inspeção: MCP Figma.
- Cobertura: todas as rotas web atuais.

## Mapeamento de rotas

| Rota | Componente atual | Contrato de preservação |
|---|---|---|
| `/` | `app/page.tsx` | Login, registro, renovação e encerramento de sessão continuam com os mesmos comportamentos e mensagens seguras. |
| `/catalogo-bncc` | `components/bncc/catalog-explorer.tsx` | Filtros, busca, paginação, estados de sessão e leitura do catálogo permanecem funcionais. |
| `/catalogo-bncc/admin` | `components/bncc/catalog-admin.tsx` | Controles continuam apenas para ADMIN; o backend permanece a autoridade para RBAC e integridade. |

## Mapeamento de frames em escopo

| Frames Figma | Aplicação atual | Uso nesta feature |
|---|---|---|
| `2:15729`, `2:15795`, `2:15887` | `/` | Entrada, criação de conta e mensagem genérica de erro de autenticação. |
| `2:16141` | `/` | Padrões visuais aplicados somente aos controles existentes de renovação e encerramento de sessão. |
| `6:18955`, `6:19236`, `6:19489`, `6:19106`, `6:19383` | `/catalogo-bncc` | Consulta, Educação Infantil, filtros, detalhe local e resultado vazio. |
| `6:19630`, `6:19859`, `6:20031` | `/catalogo-bncc/admin` | Gestão, edição de habilidade e níveis/etapas. |

Os frames `2:16303` e `2:16591` permanecem fora de escopo porque representam
capacidades administrativas ainda não especificadas para o produto.

## Regras de adaptação

1. Consultar o contexto MCP e a captura do frame antes de modificar cada rota.
2. Reutilizar componentes e lógica existentes; extrair apenas componentes de
   apresentação que reduzam duplicação sem alterar os fluxos.
3. Aplicar assets estáticos fornecidos pelo Figma somente a partir de arquivos
   locais baixados pelo fluxo MCP; não usar URLs temporárias no código.
4. Preservar textos funcionais, dados reais, `role="alert"`, `role="status"`,
   estados de sessão e controles de autorização.
5. Validar desktop e mobile. Uma variante ausente no Figma deve adaptar o layout
   sem criar novo fluxo de negócio.
6. Registrar e obter aprovação humana para toda divergência inevitável antes de
   encerrar a feature.

## Fora de escopo

- Alterar endpoints, DTOs, Prisma, banco de dados, autenticação, RBAC ou
  ownership.
- Criar recursos de negócio sugeridos somente por elementos decorativos do Figma.
- Modificar o arquivo Figma.
