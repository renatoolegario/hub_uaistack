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
        const query =
          'SELECT 1 FROM auth.apikeys WHERE apikey = $1 AND description = $2 LIMIT 1';
        const result = await client.query(query, [auth, remetente]);
        return result.rows.length > 0;
      }

      if (rota === 'cadastroCategoriaAfiliado') {
        const { nome } = dados;
        const query =
          'INSERT INTO afiliado.categorias (nome) VALUES ($1) RETURNING id, nome';
        const result = await client.query(query, [nome]);
        return result.rows[0];
      }

      if (rota === 'cadastroProdutoAfiliado') {
        const {
          id,
          nome,
          descricao,
          imagem_url,
          link_afiliado,
          categoria_id,
          subcategoria_id,
          idade_minima,
          idade_maxima,
          data_criacao,
        } = dados;
        const queryText = `INSERT INTO afiliado.afiliacoes (id, nome, descricao, imagem_url, link_afiliado, categoria_id, subcategoria_id, idade_minima, idade_maxima, data_criacao)
                           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`;
        const values = [
          id,
          nome,
          descricao,
          imagem_url,
          link_afiliado,
          categoria_id,
          subcategoria_id,
          idade_minima,
          idade_maxima,
          data_criacao,
        ];
        const result = await client.query(queryText, values);
        return result.rows[0];
      }

      if (rota === 'listarCategoriaAfiliado') {
        const query = 'SELECT id, nome FROM afiliado.categorias ORDER BY nome';
        const result = await client.query(query);
        return result.rows;
      }

      if (rota === 'listarSubcategoriaAfiliado') {
        const query =
          'SELECT id, nome, categoria_id FROM afiliado.subcategorias ORDER BY nome';
        const result = await client.query(query);
        return result.rows;
      }

      if (rota === 'listarProdutosAfiliado') {
        const query = 'SELECT * FROM afiliado.afiliacoes ORDER BY nome';
        const result = await client.query(query);
        return result.rows;
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
