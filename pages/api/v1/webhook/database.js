import { createPool } from '@vercel/postgres';

async function query(rota, dados) {
  if (!process.env.POSTGRES_URL) {
    return { error: 'Variável de ambiente POSTGRES_URL não definida' };
  }

  const pool = createPool({ connectionString: process.env.POSTGRES_URL });
  const client = await pool.connect();

  try {
    if (rota === 'auth') {
      const { auth, remetente } = dados;
      const query = 'SELECT 1 FROM auth.apikeys WHERE apikey = $1 AND description = $2 LIMIT 1';
      const result = await client.query(query, [auth, remetente]);
      return result.rows.length > 0;
    }

    if (rota === 'cadastroCategoriaAfiliado') {
      const { nome } = dados;
      const query = 'INSERT INTO afiliado.categorias (nome) VALUES ($1) RETURNING id, nome';
      const result = await client.query(query, [nome]);
      return result.rows[0];
    }

    return { error: 'Rota não encontrada', dados };
  } catch (error) {
    console.error('Erro ao executar a consulta:', error);
    return { error: `Erro interno do servidor - ${error.message}` };
  } finally {
    client.release();
  }
}

export default async function consulta(rota, dados) {
  try {
    const resultado = await query(rota, dados);
    return resultado;
  } catch (error) {
    console.error('Erro na consulta:', error);
    throw error;
  }
}
