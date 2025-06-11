import { fetchFromApi, getDbClient } from '../../../../hooks/utils';

export default async function handler(req, res) {
  try {
    // exemplo de uso de fetch
    const data = await fetchFromApi('https://jsonplaceholder.typicode.com/todos/1');

    // exemplo de uso do cliente do banco de dados
    const db = getDbClient();
    // await db.connect(); // a conexão real depende de configuração externa

    res.status(200).json({ message: 'webhook endpoint', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
