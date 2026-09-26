# Checklist de Segurança de Requisitos: Fundação e autenticação

**Propósito**: Avaliar completude, clareza, consistência e verificabilidade dos requisitos de autenticação e autorização.
**Criada em**: 2026-09-23
**Feature**: [spec.md](../spec.md)

**Nota**: Este checklist é um artefato de revisão da qualidade dos requisitos, não um plano de testes ou confirmação de implementação.
**Responsabilidade da revisão**: Marque `[x]` somente quando a pessoa revisora concluir que o critério de qualidade do requisito está satisfeito.
**Semântica**: `[x]` indica requisito revisado e adequado; não indica código implementado.

## Completude de Autenticação e Sessão

- [ ] CHK001 Estão definidos os dados aceitos e as regras de validação para cadastro, login, renovação e logout? [Completude, Spec §FR-001, FR-005–FR-008]
- [ ] CHK002 O requisito de senha não recuperável especifica critérios suficientes para avaliação sem antecipar algoritmo ou biblioteca? [Clareza, Spec §FR-003]
- [ ] CHK003 Estão definidos os estados de sessão, as transições de expiração e invalidação e seus efeitos sobre acesso privado? [Completude, Spec §FR-007–FR-009]
- [ ] CHK004 A renovação após expiração distingue claramente sessão expirada de sessão reutilizável e exige confirmação válida de identidade? [Clareza, Spec §FR-007]
- [ ] CHK005 Os requisitos de múltiplos dispositivos definem de forma consistente quais sessões permanecem válidas após logout? [Consistência, Spec §Clarificações, FR-008]
- [ ] CHK006 Está explicitamente delimitado se revogação em massa de sessões é requisito desta feature ou escopo futuro? [Escopo, Spec §Premissas]

## Autorização, RBAC e Ownership

- [ ] CHK007 Estão definidos de forma inequívoca os papéis ADMIN e PROFESSOR e a regra de atribuição pelo cadastro público? [Clareza, Spec §FR-001, FR-004]
- [ ] CHK008 O provisionamento do primeiro ADMIN define ator autorizado, limite do cadastro público e evidência auditável esperada? [Completude, Spec §Clarificações, FR-004, FR-012]
- [ ] CHK009 As exigências de autenticação para todas as rotas privadas estão completas, incluindo ausência, expiração e invalidação de sessão? [Cobertura, Spec §FR-009]
- [ ] CHK010 O requisito de RBAC distingue autorização por papel da verificação de propriedade de recurso? [Clareza, Spec §FR-010]
- [ ] CHK011 Estão definidos os cenários de negação para papel insuficiente e para recurso de outro proprietário, independentemente do frontend? [Cobertura, Spec §História 3, FR-010]
- [ ] CHK012 A specification declara como ownership será exigido para novos recursos privados sem presumir que o papel ADMIN dispense essa validação? [Completude, Spec §FR-010; Gap]

## Erros, Conta Inativa e Auditoria

- [ ] CHK013 As falhas de login, renovação e conta inativa usam uma categoria pública de erro suficientemente definida para evitar enumeração de contas? [Consistência, Spec §FR-006, FR-011, SC-003]
- [ ] CHK014 Estão definidos os casos em que uma conta inativa não pode criar, renovar ou manter acesso por sessão existente? [Cobertura, Spec §FR-006, Casos de Borda]
- [ ] CHK015 Os requisitos de auditoria enumeram todos os eventos relevantes e proíbem expressamente senha, token e segredos recuperáveis? [Completude, Spec §FR-012]
- [ ] CHK016 O conteúdo mínimo, retenção, consulta autorizada e proteção de privacidade dos eventos de auditoria estão definidos ou explicitamente adiados? [Gap, Spec §Entidades Principais]

## Critérios de Aceite e Rastreabilidade

- [ ] CHK017 Cada requisito de autenticação, autorização e sessão possui cenário de aceitação ou critério de sucesso rastreável e objetivo? [Rastreabilidade, Spec §Histórias, FR-001–FR-012]
- [ ] CHK018 Os critérios de sucesso definem resultados mensuráveis para acesso privado negado, não enumeração, auditoria e autorização por ownership? [Mensurabilidade, Spec §SC-002–SC-005]
- [ ] CHK019 As premissas distinguem decisões de produto desta feature de decisões técnicas reservadas ao planejamento? [Consistência, Spec §Premissas]
- [ ] CHK020 Os requisitos mantêm terminologia consistente para conta, usuário, sessão, proprietário, ADMIN e PROFESSOR? [Clareza, Spec §Entidades Principais]

## Notas

- Itens permanecem desmarcados até revisão humana da qualidade dos requisitos.
- `$speckit-implement` pode ler estes marcadores como gate, mas não pode alterá-los.
- `requirements.md` é o checklist interno de completude mantido por outros comandos Spec Kit.
