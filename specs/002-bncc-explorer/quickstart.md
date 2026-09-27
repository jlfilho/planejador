# Quickstart de Validação: Explorador BNCC

## Preparação

Configure `apps/api/.env`, PostgreSQL e contas ADMIN/PROFESSOR. Depois da implementação:

```powershell
pnpm --filter @planejador/api prisma:generate
pnpm --filter @planejador/api prisma:migrate
pnpm --filter @planejador/api prisma:seed
pnpm dev
```

## Cenários manuais

1. Como PROFESSOR, consulte nível, etapa/faixa, ano e eixo combinados.
2. Confirme que Educação Infantil não envia ano; combinação inválida mostra correção e não estado vazio.
3. Busque código completo/parcial e texto; confirme ordem por código e paginação.
4. Como ADMIN, crie, edite e desative itens; código/etapa de habilidade existente não podem mudar.
5. Confirme que item desativado não aparece ao PROFESSOR e que mutações docentes recebem `403`.

## Gates

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm test:integration
pnpm test:e2e
pnpm build
```

Use banco isolado e seed previsível para testes. Consulte [data-model.md](data-model.md) e [contracts/openapi.yaml](contracts/openapi.yaml).
