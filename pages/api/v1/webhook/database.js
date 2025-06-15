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
      if(manutencao === "sim"){
        const query ='SELECT 1 FROM auth.apikeys WHERE apikey = $1 LIMIT 1';
        const result = await client.query(query, [auth]);
     
        return result.rows.length > 0;
      }else{
        const query ='SELECT apikey,description  FROM auth.apikeys WHERE apikey = $1 AND description = $2 LIMIT 1';
        const result = await client.query(query, [auth, remetente]);
        
        return result.rows.length > 0;
      }
      
    }

    if (rota === 'cadastroCategoriaAfiliado') {
      const { nome, label, descricao, nicho_id} = dados;
      const query =
        'INSERT INTO afiliado.categorias (nome, label, descricao, nicho_id) VALUES ($1, $2, $3, $4) RETURNING id, nome, label, descricao, nicho_id';
      const result = await client.query(query, [nome, label, descricao,nicho_id]);
      return result.rows[0];
    }

    if (rota === 'cadastroSubcategoriaAfiliado') {
      const { nome,  label, descricao, palavras_chave, nicho_id } = dados;
   
      const query =
        'INSERT INTO afiliado.subcategorias (nome,  label, descricao, palavras_chave, nicho_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, nome, label, descricao, palavras_chave,nicho_id';
      const result = await client.query(query, [nome,  label, descricao, palavras_chave,nicho_id]);
      return result.rows[0];
    }

    if (rota === 'cadastroLinkRapido') {
      const { nome, link, subcategoria_id, nicho_id } = dados;

      const query = `
        INSERT INTO afiliado.links_rapidos (nome, link, subcategoria_id, nicho_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id, nome, link, subcategoria_id, nicho_id, criado_em
      `;

      const result = await client.query(query, [nome, link, subcategoria_id, nicho_id]);
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
        categorias,
        subcategoria_id,
        nicho_id,
        origem,
        preco,
        cliques = 0,
        link_original,
        frete = false
      } = dados;

      const sanitizedLinkOriginal =
        typeof link_original === 'string' ? link_original.split('#')[0] : link_original;

      const duplicateQuery = `
        SELECT 1 FROM afiliado.afiliacoes_pendentes WHERE link_original = $1
        UNION ALL
        SELECT 1 FROM afiliado.afiliacoes WHERE link_original = $1
        LIMIT 1
      `;
      const duplicateResult = await client.query(duplicateQuery, [sanitizedLinkOriginal]);

      if (duplicateResult.rows.length > 0) {
        return { error: 'Link ja cadastrado' };
      }


      const id = uuidv4();
      const data_criacao = new Date();

      const queryText = `
        INSERT INTO afiliado.afiliacoes (
          id, nome, descricao, imagem_url, link_afiliado,
          categorias, subcategoria_id, nicho_id,
          origem, preco, cliques, link_original, frete,
          data_criacao
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8,
          $9, $10, $11, $12, $13,
          $14
        )
        RETURNING *
      `;

      const values = [
        id,
        nome,
        descricao,
        imagem_url,
        link_afiliado,
        categorias,
        subcategoria_id,
        nicho_id,
        origem,
        preco,
        cliques,
        sanitizedLinkOriginal,
        frete,
        data_criacao
      ];

      const result = await client.query(queryText, values);
      return result.rows[0];
    }

    if (rota === 'cadastroAfiliacaoPendente') {
      const {
        nome,
        descricao,
        imagem_url,
        link_afiliado,
        origem,
        preco,
        cliques = 0,
        link_original,
        frete = false,
        nicho_id
      } = dados;

      const sanitizedLinkOriginal =
        typeof link_original === 'string' ? link_original.split('#')[0] : link_original;

      const duplicateQuery = `
        SELECT 1 FROM afiliado.afiliacoes_pendentes WHERE link_original = $1
        UNION ALL
        SELECT 1 FROM afiliado.afiliacoes WHERE link_original = $1
        LIMIT 1
      `;
      const duplicateResult = await client.query(duplicateQuery, [sanitizedLinkOriginal]);

      if (duplicateResult.rows.length > 0) {
        return { error: 'Link ja cadastrado' };
      }

      const id = uuidv4();
      const data_criacao = new Date();

      const queryText = `
        INSERT INTO afiliado.afiliacoes_pendentes (
          id, nome, descricao, imagem_url, link_afiliado,
          data_criacao, origem, preco, cliques,
          link_original, frete, nicho_id
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9,
          $10, $11, $12
        )
        RETURNING *
      `;

      const values = [
        id,
        nome,
        descricao,
        imagem_url,
        link_afiliado,
        data_criacao,
        origem,
        preco,
        cliques,
        sanitizedLinkOriginal,
        frete,
        nicho_id
      ];

      const result = await client.query(queryText, values);
      return result.rows[0];
    }

   if (rota === 'atualizarProdutoAfiliado') {
  const {
    id,
    nome,
    descricao,
    imagem_url,
    link_afiliado,
    categorias, // ✅ agora array de uuid[]
    subcategoria_id,
    nicho_id,
    origem,
    preco,
    cliques = 0,
    link_original,
    frete = false,
  } = dados;

  const queryText = `
    UPDATE afiliado.afiliacoes SET
      nome = $2,
      descricao = $3,
      imagem_url = $4,
      link_afiliado = $5,
      categorias = $6,
      subcategoria_id = $7,
      nicho_id = $8,
      origem = $9,
      preco = $10,
      cliques = $11,
      link_original = $12,
      frete = $13
    WHERE id = $1
    RETURNING *
  `;

  const values = [
    id,
    nome,
    descricao,
    imagem_url,
    link_afiliado,
    categorias, // ✅ já em formato de array de UUIDs
    subcategoria_id,
    nicho_id,
    origem,
    preco,
    cliques,
    link_original,
    frete,
  ];

  const result = await client.query(queryText, values);
  return result.rows[0];
  }



    if (rota === 'listarCategoriaAfiliado') {
      const { nicho_id } = dados || {};

      if (!nicho_id) {
        throw new Error('nicho_id é obrigatório para listar categorias');
      }

      const query = `
        SELECT id, nome, label, descricao
        FROM afiliado.categorias
        WHERE nicho_id = $1
        ORDER BY posicao ASC, nome
      `;
      const result = await client.query(query, [nicho_id]);
      return result.rows;
    }

    if (rota === 'listarSubcategoriaAfiliado') {
      const { nicho_id } = dados || {};

      if (!nicho_id) {
        throw new Error('nicho_id é obrigatório para listar subcategorias');
      }

      const query = `
        SELECT id, nome, label, descricao, palavras_chave
        FROM afiliado.subcategorias
        WHERE nicho_id = $1
        ORDER BY nome
      `;
      const result = await client.query(query, [nicho_id]);
      return result.rows;
    }

    if (rota === 'listarProdutosAfiliado') {
      const { nicho_id } = dados || {};

      let query = 'SELECT * FROM afiliado.afiliacoes';
      const values = [];

      if (nicho_id) {
        query += ' WHERE nicho_id = $1';
        values.push(nicho_id);
      }

      query += ' ORDER BY nome';

      

      const result = await client.query(query, values);

      console.log("AAA",result);
      return result.rows;
    }

    if (rota === 'listarAfiliacoesPendentes') {
      const { nicho_id } = dados || {};

      let query = 'SELECT * FROM afiliado.afiliacoes_pendentes';
      const values = [];

      if (nicho_id) {
        query += ' WHERE nicho_id = $1';
        values.push(nicho_id);
      }

      query += ' ORDER BY nome';

      const result = await client.query(query, values);
      return result.rows;
    }

    if (rota === 'listarLinksRapidos') {
      const { nicho_id } = dados || {};

      const query = `
        SELECT id, nome, link, subcategoria_id, nicho_id, criado_em
        FROM afiliado.links_rapidos
        WHERE nicho_id = $1
        ORDER BY criado_em DESC
      `;
      const result = await client.query(query, [nicho_id]);
      return result.rows;
    }

    if (rota === 'validarLinkRapido') {
      const { link } = dados || {};
      const query = 'SELECT 1 FROM afiliado.links_rapidos WHERE link = $1 LIMIT 1';
      const result = await client.query(query, [link]);
      return result.rows.length > 0;
    }

    if (rota === 'validarLinkOriginal') {
      const { link_original } = dados || {};
      const sanitizedLinkOriginal =
        typeof link_original === 'string' ? link_original.split('#')[0] : link_original;
      const query = `
        SELECT 1 FROM afiliado.afiliacoes_pendentes WHERE link_original = $1
        UNION ALL
        SELECT 1 FROM afiliado.afiliacoes WHERE link_original = $1
        LIMIT 1
      `;
      const result = await client.query(query, [sanitizedLinkOriginal]);
      return result.rows.length > 0;
    }

    if (rota === 'aprovarAfiliacaoPendente') {
      const { id, categorias, subcategoria_id } = dados;

      const selectQuery = 'SELECT * FROM afiliado.afiliacoes_pendentes WHERE id = $1 LIMIT 1';
      const selectResult = await client.query(selectQuery, [id]);

      if (selectResult.rows.length === 0) {
        return { error: 'Afiliacao pendente não encontrada' };
      }

      const pendente = selectResult.rows[0];

      const insertQuery = `
        INSERT INTO afiliado.afiliacoes (
          id, nome, descricao, imagem_url, link_afiliado,
          categorias, subcategoria_id, nicho_id,
          origem, preco, cliques, link_original, frete,
          data_criacao
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8,
          $9, $10, $11, $12, $13,
          $14
        )
        RETURNING *
      `;

      const insertValues = [
        pendente.id,
        pendente.nome,
        pendente.descricao,
        pendente.imagem_url,
        pendente.link_afiliado,
        categorias,
        subcategoria_id,
        pendente.nicho_id,
        pendente.origem,
        pendente.preco,
        pendente.cliques,
        pendente.link_original,
        pendente.frete,
        pendente.data_criacao
      ];

      const insertResult = await client.query(insertQuery, insertValues);

      await client.query('DELETE FROM afiliado.afiliacoes_pendentes WHERE id = $1', [id]);

      return insertResult.rows[0];
    }


  if (rota === 'buscarAfiliadoPorEmail') {
    const { email } = dados || {};
    const query = 'SELECT nichos, admin FROM afiliado.afiliados WHERE email = $1 LIMIT 1';
    const result = await client.query(query, [email]);
    return result.rows[0];
  }

  if (rota === 'validarApikeyAfiliado') {
    const { apikey } = dados || {};
    const query = 'SELECT 1 FROM afiliado.afiliados WHERE apikey = $1 LIMIT 1';
    const result = await client.query(query, [apikey]);
    return result.rows.length > 0;
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
