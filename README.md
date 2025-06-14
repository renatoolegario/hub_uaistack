# Hub UAI Stack


Projeto de exemplo utilizando Next.js com React.
A página inicial exibe `Site em construção...` e há um endpoint de API em `/api/v1/webhook`.

## Configuração

Copie o arquivo `.env.example` para `.env` e ajuste os valores de acordo com seu ambiente. Os seguintes campos precisam ser preenchidos:

- `POSTGRES_URL`
- `SECRET_KEY`
- `IV`
- `MANUTENCAO`

## Estrutura

- `pages/api/v1/webhook/database.js` - Funções para acessar o banco de dados PostgreSQL.
- `pages/index.js` - Página principal.
- `pages/_app.js` - Arquivo de configuração global.
- `pages/api/v1/webhook` - Endpoint de webhook.
- Rota `cadastroCategoriaAfiliado` no webhook - Endpoint para cadastrar categorias (envia `nome`, `label` e `descricao`).
- Rota `cadastroSubcategoriaAfiliado` no webhook - Endpoint para cadastrar subcategorias (envia `nome`, `label`, `descricao` e `palavras_chave`).
- Rota `cadastroLeads` no webhook - Endpoint para cadastrar leads (envia `nome`, `whatsapp`, `origem` e `campanha_origem`).

 Este repositório contém um exemplo simples de projeto Next.js. A página inicial exibe `Site em construção...` e há um endpoint de API em `/api/v1/webhook`.

### Webhook

O endpoint `/api/v1/webhook` aceita requisicoes `POST` contendo no corpo JSON os campos `rota`, `dados`, `auth` e `remetente`. Os valores de `auth` e `remetente` sao validados antes de executar qualquer rota.

### Subcategorias

A rota `listarSubcategoriaAfiliado` no webhook retorna todas as subcategorias. A rota `cadastroSubcategoriaAfiliado` agora aceita os campos `nome`, `label`, `descricao` e `palavras_chave` ao cadastrar uma subcategoria.

### Afiliações

Para cadastrar um novo produto de afiliado utilize a rota `cadastroProdutoAfiliado`.
Agora, além dos campos já existentes, o backend aceita o campo `nicho_id` para indicar o nicho do produto.
O campo `categorias` permite enviar uma lista de identificadores de categorias, possibilitando cadastrar o produto em mais de uma categoria.
Não é necessário enviar o campo `data_criacao`, pois o backend registra a data de criação automaticamente com o timestamp atual do servidor.

## Documentacao de Endpoints

Todas as requisicoes devem usar `POST /api/v1/webhook` com o corpo JSON:

```json
{ "rota": "nomeDaRota", "dados": { ... }, "auth": "SUA_CHAVE", "remetente": "descricao" }
```

### Rotas disponiveis

- **cadastroCategoriaAfiliado**
  - Entrada: `{ nome, label, descricao }`
  - Saida: `{ id, nome, label, descricao }`

- **cadastroSubcategoriaAfiliado**
  - Entrada: `{ nome, label, descricao, palavras_chave }`
  - Saida: `{ id, nome, label, descricao, palavras_chave }`

- **cadastroLeads**
  - Entrada: `{ nome, whatsapp, origem, campanha_origem }`
  - Saida: registro inserido com `id` e `data_cadastro`

- **cadastroProdutoAfiliado**
  - Entrada: `{ nome, descricao, imagem_url, link_afiliado, categorias, subcategoria_id, nicho_id, origem, preco, cliques?, link_original?, frete? }`
  - Saida: registro inserido com `id` gerado e `data_criacao`

- **listarCategoriaAfiliado**
  - Entrada: nenhum campo em `dados`
  - Saida: lista de `{ id, nome, label, descricao }`

- **listarSubcategoriaAfiliado**
  - Entrada: nenhum campo em `dados`
  - Saida: lista de `{ id, nome, label, descricao, palavras_chave }`

- **listarProdutosAfiliado**
  - Entrada opcional: `{ nicho_id }`
  - Saida: lista de produtos afiliados

- **buscarAfiliadoPorEmail**
  - Entrada: `{ email }`
  - Saida: `{ nichos, admin }`

## Scripts

- `npm run dev` – inicia o servidor de desenvolvimento.
- `npm run build` – cria a aplicação para produção.
- `npm run start` – executa a versão de produção.

## Licença

MIT

A licença deste projeto é MIT.

