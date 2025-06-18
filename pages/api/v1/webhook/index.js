import consultaBd from './database';

const allowedOrigins = [
  'https://afiliados-uaistack.vercel.app',
  'https://grupo-das-mamaes.vercel.app',
  'https://campanhas-uaistack.vercel.app',
  'https://www.mercadolivre.com.br',
  'http://localhost:3000',
];


export default async function webhook(req, res) {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { rota, dados, auth, remetente } = req.body || {};

  if (!rota || !auth || !remetente) {
    return res.status(400).json({ error: 'rota, auth and remetente are required' });
  }

  try {
    // 1. Verificar se auth é válido
    const authorized = await consultaBd('auth', { auth, remetente });
    if (!authorized) {
      return res.status(403).json({ error: 'Acesso negado' }); // ou 'refused'
    }
    // 2. Se autorizado, executar a rota solicitada
    switch (rota) {
      // Você pode adicionar cases conforme necessário
     

      case 'cadastroCategoriaAfiliado': {
        const { nome, label, descricao, nicho_id } = dados || {};
        if (!nome) {
          return res.status(400).json({ error: 'nome é obrigatório' });
        }
        const resultado = await consultaBd('cadastroCategoriaAfiliado', {
          nome,
          label,
          descricao,
          nicho_id
        });
        return res.status(200).json(resultado);
      }

      case 'cadastroSubcategoriaAfiliado': {
        const { nome, id_categoria, label, descricao, palavras_chave, nicho_id } = dados || {};
        if (!nome) {
          return res.status(400).json({ error: 'nome é obrigatório' });
        }
        const resultado = await consultaBd('cadastroSubcategoriaAfiliado', {
          nome,
          id_categoria,
          label,
          descricao,
          palavras_chave,
          nicho_id
        });
        return res.status(200).json(resultado);
      }

      case 'cadastroLinkRapido': {
        const { nome, link, subcategoria_id, nicho_id } = dados || {};
        if (!nome || !link || !subcategoria_id || !nicho_id) {
          return res.status(400).json({ error: 'nome, link, subcategoria_id e nicho_id são obrigatórios' });
        }
        const resultado = await consultaBd('cadastroLinkRapido', { nome, link, subcategoria_id, nicho_id });
        return res.status(200).json(resultado);
      }
      case 'cadastroLeads': {
        const { nome, whatsapp, origem, campanha_origem } = dados || {};
        if (!nome || !whatsapp) {
          return res.status(400).json({ error: 'nome e whatsapp são obrigatórios' });
        }
        const resultado = await consultaBd('cadastroLeads', {
          nome,
          whatsapp,
          origem,
          campanha_origem,
        });
        return res.status(200).json(resultado);
      }

      case 'cadastroLinkParaAfiliar': {
        const { link, nicho, status,chat_telegram } = dados || {};
        if (!link || !nicho) {
          return res.status(400).json({ error: 'link e nicho são obrigatórios' });
        }
        const resultado = await consultaBd('cadastroLinkParaAfiliar', {
          link,
          nicho,
          status,
          chat_telegram
        });
        return res.status(200).json(resultado);
      }
      case 'cadastroProdutoAfiliado': {
        const resultado = await consultaBd('cadastroProdutoAfiliado', dados);

        return res.status(200).json(resultado);
      }

      case 'cadastroAfiliacaoPendente': {
        const resultado = await consultaBd('cadastroAfiliacaoPendente', dados);

        return res.status(200).json(resultado);
      }

      case 'atualizarProdutoAfiliado': {
        const resultado = await consultaBd('atualizarProdutoAfiliado', dados);

        return res.status(200).json(resultado);
      }

      case 'atualizarContadorProduto': {
        const { id } = dados || {};
        if (!id) {
          return res.status(400).json({ error: 'id é obrigatório' });
        }
        const resultado = await consultaBd('atualizarContadorProduto', { id });
        return res.status(200).json(resultado);
      }

      case 'listarCategoriaAfiliado': {
        
        const { nicho_id } = dados || {};
        const resultado = await consultaBd('listarCategoriaAfiliado', {nicho_id});
        return res.status(200).json(resultado);
      }

      case 'listarSubcategoriaAfiliado': {

        const { nicho_id } = dados || {};
        const resultado = await consultaBd('listarSubcategoriaAfiliado',{nicho_id});
        return res.status(200).json(resultado);
      }

      case 'listarLinksRapidos': {
        const { nicho_id } = dados || {};
        if (!nicho_id) {
          return res.status(400).json({ error: 'nicho_id é obrigatório' });
        }
        const resultado = await consultaBd('listarLinksRapidos', { nicho_id });
        return res.status(200).json(resultado);
      }

      case 'validarLinkRapido': {
        const { link } = dados || {};
        if (!link) {
          return res.status(400).json({ error: 'link é obrigatório' });
        }
        const resultado = await consultaBd('validarLinkRapido', { link });
        return res.status(200).json(resultado);
      }

      case 'validarLinkOriginal': {
        const { link_original } = dados || {};
        if (!link_original) {
          return res.status(400).json({ error: 'link_original é obrigatório' });
        }
        const resultado = await consultaBd('validarLinkOriginal', { link_original });
        return res.status(200).json(resultado);
      }

      case 'buscarLinkParaAfiliar': {
        const resultado = await consultaBd('buscarLinkParaAfiliar');
        return res.status(200).json(resultado);
      }

      case 'deletarLinkParaAfiliar': {
        const { id } = dados || {};
        if (!id) {
          return res.status(400).json({ error: 'id é obrigatório' });
        }
        const resultado = await consultaBd('deletarLinkParaAfiliar', { id });
        return res.status(200).json(resultado);
      }

      case 'listarProdutosAfiliado': {
        const { nicho_id } = dados || {};
        const resultado = await consultaBd('listarProdutosAfiliado', { nicho_id });


        return res.status(200).json(resultado);
      }

      case 'listarAfiliacoesPendentes': {
        const { nicho_id } = dados || {};
        const resultado = await consultaBd('listarAfiliacoesPendentes', { nicho_id });

        return res.status(200).json(resultado);
      }

      case 'aprovarAfiliacaoPendente': {
        const { id, categorias, subcategoria_id } = dados || {};
        if (!id || !categorias || !subcategoria_id) {
          return res.status(400).json({ error: 'id, categorias e subcategoria_id são obrigatórios' });
        }

        const resultado = await consultaBd('aprovarAfiliacaoPendente', {
          id,
          categorias,
          subcategoria_id
        });

        return res.status(200).json(resultado);
      }

      case 'buscarAfiliadoPorEmail': {
        const { email } = dados || {};
        if (!email) {
          return res.status(400).json({ error: 'email é obrigatório' });
        }
        const resultado = await consultaBd('buscarAfiliadoPorEmail', { email });


        return res.status(200).json(resultado);
      }

      case 'validarApikeyAfiliado': {
        const { apikey } = dados || {};
        if (!apikey) {
          return res.status(400).json({ error: 'apikey é obrigatório' });
        }
        const resultado = await consultaBd('validarApikeyAfiliado', { apikey });
        return res.status(200).json(resultado);
      }

      case 'salvarSessaoPuppeteer': {
        const { nome, dados: conteudo } = dados || {};
        if (!nome || !conteudo) {
          return res.status(400).json({ error: 'nome e dados são obrigatórios' });
        }
        const resultado = await consultaBd('salvarSessaoPuppeteer', { nome, dados: conteudo });
        return res.status(200).json(resultado);
      }

      case 'buscarSessaoPuppeteer': {
        const { nome } = dados || {};
        if (!nome) {
          return res.status(400).json({ error: 'nome é obrigatório' });
        }
        const resultado = await consultaBd('buscarSessaoPuppeteer', { nome });
        return res.status(200).json(resultado);
      }

      default:
        return res.status(400).json({ error: 'Rota desconhecida' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
