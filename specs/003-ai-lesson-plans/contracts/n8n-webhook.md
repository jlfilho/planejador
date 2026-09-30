# Contrato máquina-a-máquina: API → n8n

## Transporte e autenticação

- `POST https://jlfilho.app.n8n.cloud/webhook/agente-planejador-bncc` por HTTPS,
  sem redirects.
- `Content-Type: application/json; charset=utf-8`.
- O workflow usa a credencial n8n **HTTP Header Auth**. A API envia o segredo
  de `N8N_INTEGRATION_SECRET` no cabeçalho nomeado por
  `N8N_AUTH_HEADER_NAME`; ambos devem corresponder exatamente ao credential
  `API Planejador BNCC` configurado no workflow.
- O nome do cabeçalho não aparece no export do workflow e não deve ser
  adivinhado ou exposto ao browser.

`N8N_WEBHOOK_URL` deve corresponder exatamente ao endpoint acima. Browser, JWT,
cookie, senha, `DATABASE_URL`, segredo de integração e chaves de IA nunca
participam do contrato de frontend.

## Corpo aceito pelo workflow

```json
{
  "sessao": "id-estável-do-professor",
  "habilidade": "EF01CO01 — descrição da habilidade",
  "instrucao": "string não vazia",
  "duracao": 50,
  "recursos_digitais": true
}
```

Para mais de uma habilidade selecionada, a API envia uma única string
`habilidade`, com cada código e descrição separados por linha em branco. A
execução e a associação imutável das habilidades continuam registradas no banco
da aplicação, não no n8n.

## Resposta e falhas

Sucesso é somente HTTP `200` com:

```json
{
  "success": true,
  "sessao": "id-estável-do-professor",
  "habilidade": "texto recebido",
  "answer": "Markdown não vazio",
  "format": "markdown"
}
```

A API valida `success=true`, `answer` não vazio e `format=markdown`, persiste o
conteúdo somente como `RASCUNHO` e associa referências como lista vazia quando
o workflow não as fornece. HTTP não-200, resposta incompatível e timeout não
criam plano parcial nem são retransmitidos ao navegador com detalhes internos.
