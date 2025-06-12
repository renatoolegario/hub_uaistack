import { createPool } from '@vercel/postgres';
import { v4 as uuidv4 } from 'uuid'; // novo import

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
      const { nome, label, descricao } = dados;
      const query =
        'INSERT INTO afiliado.categorias (nome, label, descricao) VALUES ($1, $2, $3) RETURNING id, nome, label, descricao';
      const result = await client.query(query, [nome, label, descricao]);
      return result.rows[0];
    }

    if (rota === 'cadastroSubcategoriaAfiliado') {
      const { nome, id_categoria, label, descricao } = dados;
      const query =
        'INSERT INTO afiliado.subcategorias (nome, categoria_id, label, descricao) VALUES ($1, $2, $3, $4) RETURNING id, nome, categoria_id, label, descricao';
      const result = await client.query(query, [nome, id_categoria, label, descricao]);
      return result.rows[0];
    }

    if (rota === 'cadastroProdutoAfiliado') {
      const {
        nome,
        descricao,
        imagem_url,
        link_afiliado,
        categoria_id,
        subcategoria_id,
        idade_minima,
        idade_maxima,
      } = dados;

      if (rota === 'cadastroSubcategoriaAfiliado') {
        const { nome } = dados;
        const query =
          'INSERT INTO afiliado.subcategorias (nome) VALUES ($1) RETURNING id, nome';
        const result = await client.query(query, [nome]);
        return result.rows[0];
      }
      const id = uuidv4(); // gera novo UUID
      const data_criacao = new Date();

      const queryText = `
        INSERT INTO afiliado.afiliacoes (
          id, nome, descricao, imagem_url, link_afiliado,
          categoria_id, subcategoria_id, idade_minima, idade_maxima, data_criacao
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING *
      `;

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
      const query = 'SELECT id, nome, label, descricao FROM afiliado.categorias ORDER BY nome';
      const result = await client.query(query);
      return result.rows;
    }

    if (rota === 'listarSubcategoriaAfiliado') {
      const query =
        'SELECT id, nome, categoria_id, label, descricao FROM afiliado.subcategorias ORDER BY nome';
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
