# Modelo de Dados: Explorador BNCC

## EixoBNCC

Enum: `PENSAMENTO_COMPUTACIONAL`, `MUNDO_DIGITAL`, `CULTURA_DIGITAL`. A API/UI mapeiam os rótulos em português.

## NivelEnsino

| Campo | Regra |
|---|---|
| id | UUID. |
| codigo | Único e estável. |
| nome | Único. |
| ativo | Oculta o nível e descendentes na consulta docente. |
| createdAt / updatedAt | Auditoria temporal. |

Relação: `NivelEnsino 1:N EtapaEnsino`.

## EtapaEnsino

| Campo | Regra |
|---|---|
| id | UUID. |
| nivelEnsinoId | Obrigatório; pertence a exatamente um nível. |
| codigo | Único dentro do nível, como `EF01`, `EF15` e `EM13`. |
| nome | Único dentro do nível. |
| anoInicial / anoFinal | Nulos na EI; iguais para ano; distintos para faixa. |
| ativo | Oculta a etapa e descendentes ao PROFESSOR. |

Unicidades: `(nivelEnsinoId, codigo)`, `(nivelEnsinoId, nome)` e intervalo não nulo exato. Sobreposição é permitida: `EF01` e `EF15` coexistem. CHECK SQL garante anos ambos nulos/preenchidos e ordem crescente; serviço/seed garantem faixas compatíveis com nível.

Relação: `EtapaEnsino 1:N HabilidadeBNCC`.

## HabilidadeBNCC

| Campo | Regra |
|---|---|
| id | UUID. |
| etapaEnsinoId | Obrigatório; pertence a exatamente uma etapa. |
| codigo | Único global, maiúsculo e imutável após criação. |
| eixo | `EixoBNCC` opcional; `null` indica classificação pendente de curadoria. |
| descricao / explicacao | Obrigatórios e não vazios. |
| ativa | Visível somente à gestão ADMIN quando desativada. |

Índices: código único; `(etapaEnsinoId, ativa, eixo, codigo)`; GIN trigrama em código, descrição e explicação.

## ExemploHabilidadeBNCC

| Campo | Regra |
|---|---|
| id | UUID. |
| habilidadeBNCCId | Obrigatório. |
| ordem | Positiva e única por habilidade. |
| texto | Obrigatório e não vazio. |

Uma habilidade possui um ou mais exemplos; serviço e seed validam esse mínimo. Índices: `(habilidadeBNCCId, ordem)` único e GIN trigrama no texto.

## Estado e acesso

- Não há DELETE; ADMIN altera `ativo`.
- PROFESSOR vê somente cadeia nível/etapa/habilidade ativa.
- ADMIN pode listar inativos em rotas administrativas.
- O catálogo é global, sem proprietário; mutações geram auditoria sem dados sensíveis.
