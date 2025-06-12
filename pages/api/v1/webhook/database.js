import { createPool } from '@vercel/postgres';
import { v4 as uuidv4 } from 'uuid'; // novo import

async function query(rota, dados) {
  if (!process.env.POSTGRES_URL) {
    return { error: 'Variável de ambiente POSTGRES_URL não definida' };
  }

  const manutencao = process.env.MANUTENCAO;

  const pool = createPool({ connectionString: process.env.POSTGRES_URL });
  const client = await pool.connect();

  try {
    if (rota === 'auth') {
      const { auth, remetente } = dados;
      
      console.log( auth, remetente, manutencao);
      if(manutencao === "sim"){
        const query ='SELECT 1 FROM auth.apikeys WHERE apikey = $1 LIMIT 1';
        const result = await client.query(query, [auth]);
        return result.rows.length > 0;
      }else{
        const query ='SELECT 1 FROM auth.apikeys WHERE apikey = $1 AND description = $2 LIMIT 1';
        const result = await client.query(query, [auth, remetente]);
        return result.rows.length > 0;
      }
      
    }

    if (rota === 'cadastroCategoriaAfiliado') {
      const { nome, label, descricao } = dados;
      const query =
        'INSERT INTO afiliado.categorias (nome, label, descricao) VALUES ($1, $2, $3) RETURNING id, nome, label, descricao';
      const result = await client.query(query, [nome, label, descricao]);
      return result.rows[0];
    }

    if (rota === 'cadastroSubcategoriaAfiliado') {
      const { nome,  label, descricao, palavras_chave } = dados;
      console.log(palavras_chave);
      const query =
        'INSERT INTO afiliado.subcategorias (nome,  label, descricao, palavras_chave) VALUES ($1, $2, $3, $4) RETURNING id, nome, label, descricao, palavras_chave';
      const result = await client.query(query, [nome,  label, descricao, palavras_chave]);
      return result.rows[0];
    }

    if (rota === 'cadastroLeads') {
      const { nome, whatsapp, origem, campanha_origem } = dados;
      const data_cadastro = new Date();
      const queryText =
        'INSERT INTO leads.leads (nome, whatsapp, origem, campanha_origem, data_cadastro) VALUES ($1, $2, $3, $4, $5) RETURNING *';
      const result = await client.query(queryText, [
        nome,
        whatsapp,
        origem,
        campanha_origem,
        data_cadastro,
      ]);
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
    origem,
    preco,
    cliques = 0,
    link_original,
    frete = false
  } = dados;

  const id = uuidv4();
  const data_criacao = new Date();

  const queryText = `
    INSERT INTO afiliado.afiliacoes (
      id, nome, descricao, imagem_url, link_afiliado,
      categoria_id, subcategoria_id,
      origem, preco, cliques, link_original, frete,
      data_criacao
    ) VALUES (
      $1, $2, $3, $4, $5,
      $6, $7,
      $8, $9, $10, $11, $12,
      $13
    )
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
    origem,
    preco,
    cliques,
    link_original,
    frete,
    data_criacao
  ];

  const result = await client.query(queryText, values);
  return result.rows[0];
}



    if (rota === 'listarCategoriaAfiliado') {
      const query = 'SELECT id, nome, label, descricao FROM afiliado.categorias ORDER BY posicao ASC, nome';
      const result = await client.query(query);
      return result.rows;
    }

    if (rota === 'listarSubcategoriaAfiliado') {
      const query =
        'SELECT id, nome, label, descricao, palavras_chave FROM afiliado.subcategorias ORDER BY nome';
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
