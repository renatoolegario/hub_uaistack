import CryptoJS from 'crypto-js';
import consultaBd from './database';

async function conversaoCripto(conteudo) {
  const secretKey = process.env.SECRET_KEY;
  if (!secretKey) {
    throw new Error("Chave secreta não definida");
  }

  const iv = CryptoJS.enc.Utf8.parse(process.env.IV);
  const key = CryptoJS.enc.Utf8.parse(secretKey);

  const encrypted = CryptoJS.AES.encrypt(conteudo, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  return encrypted.toString();
}

export default async function webhook(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { rota, dados, auth, remetente } = req.body || {};

  console.log( rota, dados, auth, remetente );
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
        const { nome, id_categoria, label, descricao } = dados || {};
        if (!nome) {
          return res.status(400).json({ error: 'nome é obrigatório' });
        }
        const resultado = await consultaBd('cadastroSubcategoriaAfiliado', {
          nome,
          id_categoria,
          label,
          descricao,
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
        const resultado = await consultaBd('listarProdutosAfiliado');

        return res.status(200).json(resultado);
      }

      default:
        return res.status(400).json({ error: 'Rota desconhecida' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
