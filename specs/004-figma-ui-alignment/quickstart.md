# Guia de Validação: Alinhamento da UI ao Figma

## Pré-requisitos

- Dependências instaladas: `pnpm install`.
- Variáveis de ambiente e serviços locais configurados conforme o projeto.
- API e frontend em execução por `pnpm dev` ou `pnpm dev:up`.
- Acesso ao arquivo Figma pela integração MCP e um frame/camada selecionável
  para cada tela a ser comparada.

## Validação visual e funcional

1. Para cada rota do [contrato de UI](./contracts/ui-alignment.md), consulte o
   frame correspondente pelo MCP Figma e mantenha sua captura como referência
   visual durante a revisão.
2. Valide `/` em desktop e mobile: login, registro, renovação e logout continuam
   acessíveis, com mensagens seguras.
3. Valide `/catalogo-bncc` em desktop e mobile: sessão, filtros combináveis,
   busca, paginação, carregamento, resultado vazio e erro continuam claros.
4. Valide `/catalogo-bncc/admin` em desktop e mobile com uma sessão ADMIN: os
   controles administrativos permanecem disponíveis e uma sessão sem ADMIN não
   recebe privilégios adicionais.
5. Registre qualquer divergência inevitável, obtenha aprovação humana e associe
   o registro à entrega antes de concluir.

## Barreiras de qualidade

Execute na raiz do repositório:

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

Todos os comandos devem concluir com êxito antes da publicação. Uma falha bloqueia
a entrega até ser corrigida.
