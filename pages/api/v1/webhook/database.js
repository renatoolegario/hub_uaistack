import { createPool } from '@vercel/postgres';

async function query(rota, dados) {
  if (!process.env.POSTGRES_URL) {
    return { error: 'Variável de ambiente POSTGRES_URL não definida' };
  }

  const pool = createPool({ connectionString: process.env.POSTGRES_URL });
  const client = await pool.connect();

          if (rota === 'auth') {
            try {
              const { auth, remetente } = dados;

              // Consulta: verificar se existe um usuário com o email e senha informados
              const queryText = 'SELECT 1 FROM auth.apikeys WHERE apikey = $1 AND description = $2 LIMIT 1';
              const result = await pool.query(queryText, [auth, remetente]);
              return result.rows.length > 0;
            } catch (error) {
              console.error('Erro ao autenticar usuário:', error);
              return { error: `Erro interno do servidor - ${error.message}` };
            }
          }

          if (rota === 'cadastroProdutoAfiliado') {
            try {
              const { id, nome, descricao, imagem_url, link_afiliado, categoria_id, subcategoria_id, idade_minima, idade_maxima, data_criacao } = dados;
              const queryText = `INSERT INTO afiliado.afiliacoes (id, nome, descricao, imagem_url, link_afiliado, categoria_id, subcategoria_id, idade_minima, idade_maxima, data_criacao)
                                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`;
              const values = [id, nome, descricao, imagem_url, link_afiliado, categoria_id, subcategoria_id, idade_minima, idade_maxima, data_criacao];
              const result = await pool.query(queryText, values);
              return result.rows[0];
            } catch (error) {
              console.error('Erro ao cadastrar afiliado:', error);
              return { error: `Erro interno do servidor - ${error.message}` };
            }
          }

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
