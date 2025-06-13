# Hub UAI Stack


Projeto de exemplo utilizando Next.js com React.
A página inicial exibe `Olá mundo` e há um endpoint de API em `/api/v1/webhook`.

## Estrutura

- `hooks/utils.js` - Funções para consumir APIs via `fetch` e criar um cliente PostgreSQL com `@vercel/postgres`.
- `pages/index.js` - Página principal.
- `pages/_app.js` - Arquivo de configuração global.
- `pages/api/v1/webhook` - Endpoint de webhook.
- Rota `cadastroCategoriaAfiliado` no webhook - Endpoint para cadastrar categorias (envia `nome`, `label` e `descricao`).
- Rota `cadastroSubcategoriaAfiliado` no webhook - Endpoint para cadastrar subcategorias (envia `nome`, `label`, `descricao` e `palavras_chaves`).
- Rota `cadastroLeads` no webhook - Endpoint para cadastrar leads (envia `nome`, `whatsapp`, `origem` e `campanha_origem`).

 Este repositório contém um exemplo simples de projeto Next.js. A página inicial exibe `Olá mundo` e há um endpoint de API em `/api/v1/webhook`.

### Webhook

O endpoint `/api/v1/webhook` aceita requisições `POST` contendo no corpo JSON os campos `rota`, `dados`, `auth` e `remetente`. A rota inicial disponível é `auth`, que verifica se o par `auth` e `remetente` existe na tabela `auth.apikeys`. Quando ambos coincidirem o retorno será `{ authorized: true }`, caso contrário `{ authorized: false }`.

### Subcategorias

A rota `listarSubcategoriaAfiliado` no webhook retorna todas as subcategorias. A rota `cadastroSubcategoriaAfiliado` agora aceita os campos `nome`, `label`, `descricao` e `palavras_chaves` ao cadastrar uma subcategoria.

### Afiliações

Para cadastrar um novo produto de afiliado utilize a rota `cadastroProdutoAfiliado`.
Agora, além dos campos já existentes, o backend aceita o campo `nicho` para indicar o nicho do produto.
Não é necessário enviar o campo `data_criacao`, pois o backend registra a data de criação automaticamente com o timestamp atual do servidor.
## Documentacao de Endpoints

Todas as rotas utilizam o endpoint `/api/v1/webhook` com metodo `POST`. O corpo da requisicao deve conter os campos `rota`, `dados`, `auth` e `remetente`.
- **auth**: `{ rota: "auth", auth: "SUA_CHAVE", remetente: "descricao" }`
- **cadastroCategoriaAfiliado**: `{ rota: "cadastroCategoriaAfiliado", dados: { nome, label, descricao }, auth, remetente }`
- **cadastroSubcategoriaAfiliado**: `{ rota: "cadastroSubcategoriaAfiliado", dados: { nome, id_categoria, label, descricao, palavras_chave }, auth, remetente }`
- **cadastroLeads**: `{ rota: "cadastroLeads", dados: { nome, whatsapp, origem, campanha_origem }, auth, remetente }`
- **cadastroProdutoAfiliado**: `{ rota: "cadastroProdutoAfiliado", dados: { nome, descricao, imagem_url, link_afiliado, categoria_id, subcategoria_id, nicho, idade_minima, idade_maxima, origem, preco, cliques, link_original, frete }, auth, remetente }`
- **listarCategoriaAfiliado**: `{ rota: "listarCategoriaAfiliado", auth, remetente }`
- **listarSubcategoriaAfiliado**: `{ rota: "listarSubcategoriaAfiliado", auth, remetente }`
- **listarProdutosAfiliado**: `{ rota: "listarProdutosAfiliado", auth, remetente }`

## Scripts

- `npm run dev` – inicia o servidor de desenvolvimento.
- `npm run build` – cria a aplicação para produção.
- `npm run start` – executa a versão de produção.

## Licença

MIT

A licença deste projeto é MIT.

