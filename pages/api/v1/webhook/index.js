import consultaBd from './database';

const allowedOrigins = [
  'https://afiliados-uaistack.vercel.app',
  'https://grupo-das-mamaes.vercel.app',
  'https://campanhas-uaistack.vercel.app',
  'http://localhost:3001'
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
        const { nome, label, descricao } = dados || {};
        if (!nome) {
          return res.status(400).json({ error: 'nome é obrigatório' });
        }
        const resultado = await consultaBd('cadastroCategoriaAfiliado', {
          nome,
          label,
          descricao,
        });
        return res.status(200).json(resultado);
      }

      case 'cadastroSubcategoriaAfiliado': {
        const { nome, id_categoria, label, descricao, palavras_chave } = dados || {};
        if (!nome) {
          return res.status(400).json({ error: 'nome é obrigatório' });
        }
        const resultado = await consultaBd('cadastroSubcategoriaAfiliado', {
          nome,
          id_categoria,
          label,
          descricao,
          palavras_chave,
        });
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
      case 'cadastroProdutoAfiliado': {
        const resultado = await consultaBd('cadastroProdutoAfiliado', dados);

        return res.status(200).json(resultado);
      }

      case 'listarCategoriaAfiliado': {
        const resultado = await consultaBd('listarCategoriaAfiliado');
        return res.status(200).json(resultado);
      }

      case 'listarSubcategoriaAfiliado': {
        const resultado = await consultaBd('listarSubcategoriaAfiliado');
        return res.status(200).json(resultado);
      }

      case 'listarProdutosAfiliado': {
        const { nicho_id } = dados || {};
        const resultado = await consultaBd('listarProdutosAfiliado', { nicho_id });

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

      default:
        return res.status(400).json({ error: 'Rota desconhecida' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
