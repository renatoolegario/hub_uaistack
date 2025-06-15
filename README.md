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
Produtos que aguardam análise podem ser cadastrados por meio da rota `cadastroAfiliacaoPendente`, armazenando as informações na tabela `afiliacoes_pendentes`.
Para consultar esses registros utilize a rota `listarAfiliacoesPendentes`, que retorna todos os produtos pendentes.
Para aprovar uma afiliação em análise utilize `aprovarAfiliacaoPendente`, movendo o registro para `afiliacoes` e removendo-o da tabela de pendentes.


## Documentacao de Endpoints

Todas as requisicoes devem usar `POST /api/v1/webhook` com o corpo JSON:

```json
{ "rota": "nomeDaRota", "dados": { ... }, "auth": "SUA_CHAVE", "remetente": "descricao" }
```

### Rotas disponiveis

| Rota | Dados de entrada | Resposta |
|------|-----------------|----------|
| `cadastroCategoriaAfiliado` | `{ nome, label, descricao, nicho_id }` | `{ id, nome, label, descricao, nicho_id }` |
| `cadastroSubcategoriaAfiliado` | `{ nome, label, descricao, palavras_chave, nicho_id }` | `{ id, nome, label, descricao, palavras_chave, nicho_id }` |
| `cadastroLeads` | `{ nome, whatsapp, origem, campanha_origem }` | Registro inserido com `id` e `data_cadastro` |
| `cadastroProdutoAfiliado` | `{ nome, descricao, imagem_url, link_afiliado, categorias, subcategoria_id, nicho_id, origem, preco, cliques?, link_original?, frete? }` | Registro inserido com `id` e `data_criacao` |
| `cadastroAfiliacaoPendente` | `{ nome, descricao, imagem_url, link_afiliado, origem, preco, cliques?, link_original?, frete?, nicho_id }` | Registro pendente inserido |
| `atualizarProdutoAfiliado` | `{ id, nome, descricao, imagem_url, link_afiliado, categorias, subcategoria_id, nicho_id, origem, preco, cliques?, link_original?, frete? }` | Registro atualizado |
| `listarCategoriaAfiliado` | `{ nicho_id }` | Lista de `{ id, nome, label, descricao }` |
| `listarSubcategoriaAfiliado` | `{ nicho_id }` | Lista de `{ id, nome, label, descricao, palavras_chave }` |
| `listarProdutosAfiliado` | `{ nicho_id? }` | Lista de produtos afiliados |
| `listarAfiliacoesPendentes` | `{ nicho_id? }` | Lista de produtos pendentes |
| `aprovarAfiliacaoPendente` | `{ id, categorias, subcategoria_id }` | Registro aprovado movido para `afiliacoes` |
| `buscarAfiliadoPorEmail` | `{ email }` | `{ nichos, admin }` |

## Scripts

- `npm run dev` – inicia o servidor de desenvolvimento.
- `npm run build` – cria a aplicação para produção.
- `npm run start` – executa a versão de produção.

## Licença

MIT

A licença deste projeto é MIT.

