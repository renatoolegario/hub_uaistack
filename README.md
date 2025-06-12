# Hub UAI Stack


Projeto de exemplo utilizando Next.js com React.
A página inicial exibe `Olá mundo` e há um endpoint de API em `/api/v1/webhook`.

## Estrutura

- `hooks/utils.js` - Funções para consumir APIs via `fetch` e criar um cliente PostgreSQL com `@vercel/postgres`.
- `pages/index.js` - Página principal.
- `pages/_app.js` - Arquivo de configuração global.
- `pages/api/v1/webhook` - Endpoint de webhook.
- Rota `cadastroSubcategoriaAfiliado` no webhook - Endpoint para cadastrar subcategorias.

 Este repositório contém um exemplo simples de projeto Next.js. A página inicial exibe `Olá mundo` e há um endpoint de API em `/api/v1/webhook`.

### Webhook

O endpoint `/api/v1/webhook` aceita requisições `POST` contendo no corpo JSON os campos `rota`, `dados`, `auth` e `remetente`. A rota inicial disponível é `auth`, que verifica se o par `auth` e `remetente` existe na tabela `auth.apikeys`. Quando ambos coincidirem o retorno será `{ authorized: true }`, caso contrário `{ authorized: false }`.

### Subcategorias

A rota `listarSubcategoriaAfiliado` no webhook retorna todas as subcategorias e suas respectivas categorias, enquanto `cadastroSubcategoriaAfiliado` permite inserir novas subcategorias informando `nome` e `id_categoria`.

### Afiliações

Para cadastrar um novo produto de afiliado utilize a rota `cadastroProdutoAfiliado`.
Não é necessário enviar o campo `data_criacao`, pois o backend registra a data de criação automaticamente com o timestamp atual do servidor.


## Scripts

- `npm run dev` – inicia o servidor de desenvolvimento.
- `npm run build` – cria a aplicação para produção.
- `npm run start` – executa a versão de produção.

## Licença

MIT

A licença deste projeto é MIT.

