# Modelo de Dados

| Entidade | Campos e regras |
|---|---|
| Usuário | `id`, `email` normalizado/único, `passwordHash`, `role` ADMIN/PROFESSOR, `isActive`, datas. Cadastro público cria PROFESSOR; ADMIN inicial é provisionado externamente. |
| Sessão | `id`, `userId`, `refreshTokenHash`, `familyId`, expiração, revogação e datas. Uma conta possui várias sessões; logout revoga apenas a atual; reuso de refresh revoga família. |
| Auditoria | `id`, tipo, resultado, usuário/sessão opcionais, contexto sanitizado e data. Nunca senha, token ou segredo. |

Criar migration inicial com enums, relações, unicidade de e-mail e índices para `userId`/`familyId`.
