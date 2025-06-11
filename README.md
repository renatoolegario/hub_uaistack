# Hub UAI Stack

Projeto de exemplo utilizando Next.js com React.
A página inicial exibe `Olá mundo` e há um endpoint de API em `/api/v1/webhook`.

## Estrutura

- `hooks/utils.js` - Funções para consumir APIs via `fetch` e criar um cliente PostgreSQL com `@vercel/postgres`.
- `pages/index.js` - Página principal.
- `pages/_app.js` - Arquivo de configuração global.
- `pages/api/v1/webhook` - Endpoint de exemplo.

## Scripts

- `npm run dev` – inicia o servidor de desenvolvimento.
- `npm run build` – cria a aplicação para produção.
- `npm run start` – executa a versão de produção.

## Licença

MIT
