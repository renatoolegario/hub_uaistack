import { getDbClient } from '../../../../hooks/utils';

async function checkAuth(apiKey, remetente) {
  const db = getDbClient();
  await db.connect();
  const query = 'SELECT 1 FROM auth.apikeys WHERE apikey = $1 AND description = $2 LIMIT 1';
  const result = await db.query(query, [apiKey, remetente]);
  return result.rows.length > 0;
}

export default async function handler(req, res) {
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
        const authorized = await checkAuth(auth, remetente);
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
