# Pesquisa

- **Monorepo**: pnpm workspaces + Turborepo; Nest permanece app individual. [pnpm](https://pnpm.io/workspaces), [Turbo](https://turborepo.dev/docs/crafting-your-repository/configuring-tasks).
- **Senha e sessão**: Argon2id; access curto; refresh por família, rotativo, hash persistido; reuso revoga a família. [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html), [Auth0](https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them/).
- **Cookies/CORS**: `HttpOnly`, `Secure`, SameSite apropriado, origem exata `WEB_ORIGIN`, credenciais; nunca wildcard. [MDN](https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/Cookies), [Nest CORS](https://docs.nestjs.com/security/cors).
- **API**: guard global deny-by-default, `@Public()`, roles, ownership no serviço/repositório, DTO whitelist e Swagger. [Nest auth](https://docs.nestjs.com/security/authentication), [validation](https://docs.nestjs.com/techniques/validation).
- **Migrations**: histórico Prisma versionado; desenvolvimento cria migration, CI/produção aplica pendentes. [Prisma](https://www.prisma.io/docs/orm/prisma-migrate/workflows/development-and-production).
