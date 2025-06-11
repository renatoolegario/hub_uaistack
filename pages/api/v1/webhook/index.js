import CryptoJS from 'crypto-js';
import consultaBd from './database';

async function conversaoCripto(conteudo) {
  const secretKey = process.env.SECRET_KEY;
  if (!secretKey) {
    throw new Error("Chave secreta não definida");
  }
  
  // Definindo um IV fixo (16 bytes para AES)
  const iv = CryptoJS.enc.Utf8.parse(process.env.IV); // Exemplo fixo, NÃO use em produção sem compreender os riscos
  
  // Converter a secretKey para um formato adequado (supondo que ela tenha o tamanho correto)
  const key = CryptoJS.enc.Utf8.parse(secretKey);

  // Realiza a criptografia utilizando o modo CBC e padding PKCS7
  const encrypted = CryptoJS.AES.encrypt(conteudo, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  
  return encrypted.toString();
}

const rotasSuportadas = [
  'auth',

]

export default async function webhook(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { rota, dados, auth, remetente } = req.body || {};

  if (!rota || !auth || !remetente) {
    res.status(400).json({ error: 'rota, auth and remetente are required' });
    return;
  }

  try {
    switch (rota) {
      case 'auth': {
        const authorized = await consultaBd(rota, {auth, remetente});
        res.status(200).json({ authorized });
        break;
      }
      default:
        res.status(400).json({ error: 'Unknown route' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
