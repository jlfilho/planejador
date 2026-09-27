# Checklist de Requisitos: Explorador BNCC

**Propósito**: Revisar a qualidade, clareza, consistência e cobertura dos requisitos do catálogo BNCC antes da implementação.

**Criada em**: 2026-09-26

**Feature**: [spec.md](../spec.md)

**Nota**: Esta checklist é um artefato de revisão da qualidade dos requisitos, não um plano de testes de implementação.

**Propriedade da revisão**: A checklist pertence ao revisor. Marque um item `[x]` somente quando o critério de qualidade do requisito estiver satisfeito.

**Semântica dos marcadores**: `[x]` significa requisito revisado e aprovado quanto à qualidade; não significa trabalho implementado.

## Completude de Cardinalidades e Integridade

- [X] CHK001 Os requisitos definem inequivocamente a cardinalidade `NivelEnsino 1:N EtapaEnsino 1:N HabilidadeBNCC` e excluem associação de uma etapa a múltiplos níveis? [Completude, Spec §FR-005, §FR-012]
- [X] CHK002 A regra de etapas por ano único, faixa de anos e ausência de ano na Educação Infantil está especificada sem deixar casos intermediários indefinidos? [Clareza, Spec §FR-005, §FR-006]
- [X] CHK003 A especificação define se intervalos de anos sobrepostos no mesmo nível são permitidos e por qual motivo de negócio? [Gap, Spec §FR-005, §FR-006]
- [X] CHK004 Os requisitos distinguem unicidade global do código BNCC, unicidade de etapa por nível e regras de nomes/recortes dentro do nível? [Completude, Spec §FR-011, §FR-012]
- [X] CHK005 A imutabilidade do código BNCC está consistente com o escopo de edição administrativa e com os cenários de aceitação? [Consistência, Spec §FR-003, §FR-011, História 3]
- [X] CHK006 A exigência de ao menos um exemplo e a ordem de múltiplos exemplos possuem critérios objetivos para conteúdo vazio, duplicado ou ordem inválida? [Clareza, Spec §FR-011]

## Filtros, Busca e Resultado Vazio

- [X] CHK007 A semântica de combinação AND entre nível, etapa/ano e eixo está definida para todos os filtros opcionais? [Clareza, Spec §FR-007]
- [X] CHK008 As regras para etapa incompatível, ano não coberto, ano na Educação Infantil e eixo fora do conjunto são completas e não conflitam com resultado vazio? [Consistência, Spec §FR-009, Casos de Borda]
- [X] CHK009 A especificação define se a busca textual considera normalização de maiúsculas, acentos e correspondência parcial de forma suficiente para critérios de aceite? [Gap, Spec §FR-015]
- [X] CHK010 A regra de busca por código completo/parcial e texto identifica explicitamente quais campos textuais fazem parte da pesquisa? [Completude, Spec §FR-015]
- [X] CHK011 O estado de resultado vazio está definido como distinto de entrada inválida para filtros e busca, inclusive quando critérios são combinados? [Clareza, Spec §FR-010, Casos de Borda]

## Paginação e Ordenação

- [X] CHK012 A ordenação crescente por código BNCC está definida como ordem estável para todas as páginas e consultas administrativas aplicáveis? [Clareza, Spec §FR-016]
- [X] CHK013 O tamanho de página, limites, numeração inicial e comportamento para página além do total possuem valores e respostas de requisito claramente definidos? [Completude, Spec §FR-016, Premissas]
- [X] CHK014 Os critérios de aceite cobrem preservação de filtros e busca ao avançar ou retroceder páginas? [Gap, Spec §SC-007]

## Permissões, Estado e Catálogo Global

- [X] CHK015 As permissões de consulta para PROFESSOR e de criação, edição e desativação para ADMIN estão completas para todos os três tipos de item? [Completude, Spec §FR-002 a §FR-004]
- [X] CHK016 A especificação diferencia de modo inequívoco a leitura docente de ativos da leitura administrativa de inativos? [Clareza, Spec §FR-013, Casos de Borda]
- [X] CHK017 O requisito de catálogo global documenta explicitamente a não aplicabilidade de ownership sem enfraquecer a exigência de RBAC no backend? [Consistência, Spec §FR-004, §FR-014]
- [X] CHK018 As regras de desativação de nível ou etapa e seu efeito sobre habilidades descendentes estão definidas, incluindo reversão e consulta administrativa? [Gap, Spec §FR-003, §FR-013]
- [X] CHK019 Os requisitos definem quais eventos administrativos do catálogo devem ser auditáveis e quais dados não podem constar nesses registros? [Gap, Constituição I e V]

## Critérios de Aceite e Dependências

- [X] CHK020 Cada critério de sucesso possui uma condição observável, população de teste e resultado mensurável sem depender de detalhe de implementação? [Mensurabilidade, Spec §SC-001 a §SC-007]
- [X] CHK021 Os critérios de sucesso cobrem falhas de autorização e integridade com precisão equivalente aos fluxos docentes de leitura? [Cobertura, Spec §SC-004 a §SC-006]
- [X] CHK022 A dependência de autenticação, papéis e sessão da Feature 001 está documentada com comportamento esperado se a sessão estiver ausente ou inválida? [Dependência, Spec §FR-001, Premissas]
- [X] CHK023 Os requisitos de tempo para localizar habilidade e de desempenho de consulta são compatíveis e distinguem meta de experiência de meta técnica? [Consistência, Spec §SC-001, Plan §Contexto Técnico]

## Notas

- Itens `[Gap]` indicam aspectos que precisam de requisito adicional ou de decisão explícita antes da implementação.
- `$speckit-implement` lê marcadores de checklist como gate, mas não pode alterá-los.
- `requirements.md` possui ciclo de vida separado, mantido por `$speckit-specify` e `$speckit-clarify`.
