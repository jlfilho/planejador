# Pesquisa: Alinhamento da UI ao Figma

## Decisões

### 1. Reutilizar rotas, componentes e fluxos existentes

**Decisão**: Atualizar `app/page.tsx`, `catalogo-bncc/page.tsx`,
`catalogo-bncc/admin/page.tsx` e seus componentes atuais, em vez de criar uma
segunda interface ou alterar o backend.

**Justificativa**: As rotas já concentram os fluxos autorizados e as chamadas à
API. Reutilizá-las preserva sessão, RBAC, ownership e os contratos existentes.

**Alternativas consideradas**: Recriar as telas em novas rotas foi rejeitado por
duplicar fluxos; alterar endpoints foi rejeitado porque a feature é visual.

### 2. Usar o Figma como referência visual, não como fonte de dados

**Decisão**: Aplicar estrutura visual, tipografia, cores, espaçamento,
componentes e estados definidos no Figma; preservar dados reais, textos
funcionais e comportamentos do produto.

**Justificativa**: Corresponde à decisão registrada em `spec.md` e evita que
dados demonstrativos do arquivo alterem o fluxo real.

**Alternativas consideradas**: Copiar textos e dados de exemplo do Figma foi
rejeitado por alterar conteúdo funcional e potencialmente induzir comportamento
incorreto.

### 3. Inspecionar frames e assets com MCP Figma durante a implementação

**Decisão**: Para cada rota, obter o contexto do frame correspondente pelo MCP
Figma, usar a captura de tela como alvo visual e baixar apenas assets estáticos
referenciados para arquivos locais do projeto.

**Justificativa**: O MCP retornou uma captura do nó raiz; a consulta de contexto
estruturado solicitou uma camada selecionada no Figma. A implementação deve
obter contexto de cada frame ou camada selecionada antes de modificar a rota
correspondente.

**Alternativas consideradas**: Inferir o layout sem contexto de frame e manter
URLs temporárias de assets no navegador foram rejeitados por impedir fidelidade
visual e por expiração dos recursos, respectivamente.

### 4. Cobrir desktop e mobile sem inventar fluxos

**Decisão**: Adaptar as telas atuais para desktop e mobile. Quando houver apenas
uma variante no Figma, preservar hierarquia, legibilidade e ações existentes no
outro tamanho de tela.

**Justificativa**: Decisão explícita da clarificação; fornece uma experiência
consistente sem criar requisitos de negócio.

### 5. Validar visual e comportamento no frontend existente

**Decisão**: Complementar os testes atuais com verificações de estados e fluxos
nas três rotas, além de revisão visual por screenshot desktop/mobile contra os
frames Figma. Divergências necessárias exigem aprovação humana.

**Justificativa**: Preserva as barreiras de qualidade da Constituição e atende à
regra de aprovação de divergências da feature.
