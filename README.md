# Hub UAI Stack

Projeto de exemplo utilizando Next.js para expor uma API de webhook e uma página inicial simples. O foco é disponibilizar rotas para cadastro e consulta de dados em um banco PostgreSQL.

## Configuração

1. Copie `.env.example` para `.env`.
2. Preencha as variáveis a seguir:
   - `POSTGRES_URL` – string de conexão com o banco PostgreSQL.
   - `SECRET_KEY` – chave utilizada para criptografia.
   - `IV` – vetor de inicialização para criptografia.
   - `MANUTENCAO` – `sim` ou `nao` para habilitar ou não o modo manutenção.
   - `CHAVE_GPT` – chave da API OpenAI usada no cron.
   - `BASE_LINK_CURTO` – URL base para geração de links curtos.

## Scripts

- `npm run dev` – inicia o servidor de desenvolvimento.
- `npm run build` – cria a aplicação para produção.
- `npm run start` – executa a versão de produção.

## API

Todas as chamadas são feitas para `POST /api/v1/webhook`. O corpo da requisição deve conter:

```json
{
  "rota": "nomeDaRota",
  "dados": { ... },
  "auth": "SUA_CHAVE",
  "remetente": "descricao"
}
```

Somente as origens listadas no código são aceitas pelo CORS:
- `https://afiliados-uaistack.vercel.app`
- `https://grupo-das-mamaes.vercel.app`
- `https://campanhas-uaistack.vercel.app`
- `https://www.mercadolivre.com.br`
- `http://localhost:3000`

### Rotas disponíveis

| Rota | Campos em `dados` | Resposta |
|------|------------------|---------|
| `cadastroCategoriaAfiliado` | `{ nome, label, descricao, nicho_id }` | categoria criada |
| `cadastroSubcategoriaAfiliado` | `{ nome, id_categoria?, label, descricao, palavras_chave, nicho_id }` | subcategoria criada |
| `cadastroLinkRapido` | `{ nome, link, subcategoria_id, nicho_id }` | link rápido criado |
| `cadastroLeads` | `{ nome, whatsapp, origem?, campanha_origem? }` | lead inserido |
| `cadastroLinkParaAfiliar` | `{ link, nicho, status?, chat_telegram? }` | registro criado |
| `cadastroProdutoAfiliado` | vários campos de produto | produto criado |
| `cadastroAfiliacaoPendente` | mesmos campos de produto | produto pendente |
| `atualizarProdutoAfiliado` | mesmos campos de produto mais `id` | produto atualizado |
| `atualizarContadorProduto` | `{ id }` | contador incrementado |
| `atualizarPageview` | `{ codigo_curto }` | pageview incrementado |
| `listarCategoriaAfiliado` | `{ nicho_id }` | lista de categorias |
| `listarSubcategoriaAfiliado` | `{ nicho_id }` | lista de subcategorias |
| `listarLinksRapidos` | `{ nicho_id }` | links rápidos |
| `validarLinkRapido` | `{ link }` | boolean |
| `validarLinkOriginal` | `{ link_original }` | boolean |
| `buscarLinkParaAfiliar` | `{}` | link pendente |
| `deletarLinkParaAfiliar` | `{ id }` | link removido |
| `listarProdutosAfiliado` | `{ nicho_id? }` | lista de produtos |
| `buscarProdutoAfiliado` | `{ codigo_curto }` | produto encontrado |
| `listarAfiliacoesPendentes` | `{ nicho_id? }` | produtos pendentes |
| `aprovarAfiliacaoPendente` | `{ id, categorias, subcategoria_id }` | pendente aprovado |
| `buscarAfiliadoPorEmail` | `{ email }` | informações do afiliado |
| `validarApikeyAfiliado` | `{ apikey }` | boolean |
| `salvarSessaoPuppeteer` | `{ nome, dados }` | sessão salva |
| `buscarSessaoPuppeteer` | `{ nome }` | sessão encontrada |
| `buscarTextoParaGrupo` | `{ apikey }` | produto para divulgação (imagem em base64 opcional) |

O endpoint `buscarTextoParaGrupo` baixa a imagem do produto e a devolve em `imagem_64` quando possível.

## Cron job

A rota `GET /api/v1/cron/gerarTextoParaGrupo` é executada automaticamente a cada minuto (configurado em `vercel.json`). Ela busca uma afiliação sem texto e utiliza a API OpenAI para gerar um texto promocional, salvando-o no banco de dados.

## Licença

MIT
