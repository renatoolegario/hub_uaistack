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
      case 'minhaRota1': {
        // lógica
        return res.status(200).json({ sucesso: true });
      }

      case 'minhaRota2': {
        // lógica
        return res.status(200).json({ sucesso: true });
      }

      case 'cadastroProdutoAfiliado': {
        const resultado = await consultaBd('cadastroProdutoAfiliado', dados);
        return res.status(200).json(resultado);
      }

      default:
        return res.status(400).json({ error: 'Rota desconhecida' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
