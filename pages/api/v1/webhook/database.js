import { createPool } from '@vercel/postgres';
import { v4 as uuidv4 } from 'uuid'; // novo import


function gerarCodigoCurto(tamanho = 4) {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = '';
  for (let i = 0; i < tamanho; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return codigo;
}


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
      const { nome, link,  nicho_id } = dados;

      const query = `
        INSERT INTO afiliado.links_rapidos (nome, link,  nicho_id)
        VALUES ($1, $2, $3)
        RETURNING id, nome, link,  nicho_id, criado_em
      `;

      const result = await client.query(query, [nome, link, nicho_id]);
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
        nicho_id,
        id_link_para_afiliar
      } = dados;

      const sanitizedLinkOriginal =
        typeof link_original === 'string' ? link_original.split('#')[0] : link_original;

      // Se informado, busca o nicho vinculado ao link na tabela link_para_afiliar
      let nichoIdFinal = nicho_id;
      if (id_link_para_afiliar) {
        const nichoQuery = 'SELECT nicho FROM afiliado.link_para_afiliar WHERE id = $1 LIMIT 1';
        const nichoResult = await client.query(nichoQuery, [id_link_para_afiliar]);
        if (nichoResult.rows.length > 0) {
          nichoIdFinal = nichoResult.rows[0].nicho;
        }
      }

      // Verifica se o link já existe
      const duplicateQuery = `
        SELECT 1 FROM afiliado.afiliacoes_pendentes WHERE link_original = $1
        UNION ALL
        SELECT 1 FROM afiliado.afiliacoes WHERE link_original = $1
        LIMIT 1
      `;
      const duplicateResult = await client.query(duplicateQuery, [sanitizedLinkOriginal]);

      if (duplicateResult.rows.length > 0) {
        if (id_link_para_afiliar) {
          await client.query(
            'DELETE FROM afiliado.link_para_afiliar WHERE id = $1',
            [id_link_para_afiliar]
          );
        }
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
        nichoIdFinal
      ];

      const result = await client.query(queryText, values);
      let response = result.rows[0];

      // Se houver id_link_para_afiliar, busca chat_telegram e contagem de links restantes
      if (id_link_para_afiliar) {
        const chatQuery = `
          SELECT chat_telegram 
          FROM afiliado.link_para_afiliar 
          WHERE id = $1 
          LIMIT 1
        `;
        const chatResult = await client.query(chatQuery, [id_link_para_afiliar]);

        if (chatResult.rows.length > 0) {
          const chatTelegram = chatResult.rows[0].chat_telegram;

          const countQuery = `
            SELECT COUNT(*) 
            FROM afiliado.link_para_afiliar 
            WHERE chat_telegram = $1
          `;
          const countResult = await client.query(countQuery, [chatTelegram]);
          const restantes = parseInt(countResult.rows[0].count, 10);

          response = {
            ...response,
            chat_telegram: chatTelegram,
            links_restantes: restantes
          };
        }

        // Remove o link que acabou de ser processado
        await client.query(
          'DELETE FROM afiliado.link_para_afiliar WHERE id = $1',
          [id_link_para_afiliar]
        );
      }

      return response;
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
        frete = $13,
        data_proxima_verificacao = $14
      WHERE id = $1
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
      link_original,
      frete,
      new Date() // Agora atualiza com o momento atual
    ];

    const result = await client.query(queryText, values);
    return result.rows[0];
  }


  if (rota === 'atualizarContadorProduto') {
    const { id } = dados || {};
    const query = `
      UPDATE afiliado.afiliacoes
      SET cliques = cliques + 1
      WHERE id = $1
      RETURNING id, cliques
    `;
    const result = await client.query(query, [id]);
    return result.rows[0];
  }

  if (rota === 'atualizarPageview') {
    const { codigo_curto } = dados || {};
    const query = `
      UPDATE afiliado.afiliacoes
      SET pageview = COALESCE(pageview, 0) + 1
      WHERE codigo_curto = $1
      RETURNING id, pageview, codigo_curto
    `;
    const result = await client.query(query, [codigo_curto]);
    return result.rows[0];
  }

  if (rota === 'atualizarContadorCliques') {
    const { codigo_curto } = dados || {};
    const query = `
      UPDATE afiliado.afiliacoes
      SET cliques = cliques + 1
      WHERE codigo_curto = $1
      RETURNING id, codigo_curto, cliques
    `;
    const result = await client.query(query, [codigo_curto]);
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

      return result.rows;
    }

    if (rota === 'buscarProdutoAfiliado') {
      const { codigo_curto } = dados || {};
      const query = 'SELECT * FROM afiliado.afiliacoes WHERE codigo_curto = $1 LIMIT 1';
      const result = await client.query(query, [codigo_curto]);
      return result.rows[0];
    }

    if (rota === 'listarAfiliacoesPendentes') {
      const { nicho_id } = dados || {};

      let query = 'SELECT * FROM afiliado.afiliacoes_pendentes';
      const values = [];

      if (nicho_id) {
        query += ' WHERE nicho_id = $1';
        values.push(nicho_id);
      }

      query += ' ORDER BY data_criacao ASC';

      const result = await client.query(query, values);
      return result.rows;
    }

    if (rota === 'listarLinksRapidos') {
      const { nicho_id } = dados || {};

      const query = `
        SELECT id, nome, link, nicho_id, criado_em
        FROM afiliado.links_rapidos
        WHERE nicho_id = $1
        ORDER BY criado_em DESC
      `;
      const result = await client.query(query, [nicho_id]);
      return result.rows;
    }

    if (rota === 'listarLinksRapidosGeral') {
      
      const query = `
        SELECT id, nome, link,  nicho_id, criado_em
        FROM afiliado.links_rapidos
        ORDER BY criado_em DESC
      `;
      const result = await client.query(query);
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


if (rota === 'cadastroLinkParaAfiliar') {
  let { link, nicho, status = 'aguardando', chat_telegram = null } = dados || {};

  if (chat_telegram === null && nicho) {
    const buscarChatQuery = `
      SELECT chat_telegram 
      FROM afiliado.afiliados 
      WHERE nichos = $1
      LIMIT 1
    `;
    const chatResult = await client.query(buscarChatQuery, [nicho]);

    if (chatResult.rows.length > 0) {
      chat_telegram = chatResult.rows[0].chat_telegram;
    }
  }

  const query = `
    INSERT INTO afiliado.link_para_afiliar (link, nicho, status, chat_telegram)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (link) DO NOTHING
    RETURNING id, link, nicho, status, data_criacao
  `;

  const result = await client.query(query, [link, nicho, status, chat_telegram]);

  if (result.rowCount === 0) {
    return { ok: true, duplicado: true, mensagem: 'Link já cadastrado.' };
  }

  return { ok: true, ...result.rows[0] };
}

  if (rota === 'cadastroLinksParaAfiliar') {
    const { nicho, links } = dados || {};

    if (!Array.isArray(links) || links.length === 0) {
      return { error: 'links deve ser um array' };
    }

    let chatTelegram = null;
    if (nicho) {
      const buscarChatQuery = `
        SELECT chat_telegram
        FROM afiliado.afiliados
        WHERE nichos = $1
        LIMIT 1
      `;
      const chatResult = await client.query(buscarChatQuery, [nicho]);
      if (chatResult.rows.length > 0) {
        chatTelegram = chatResult.rows[0].chat_telegram;
      }
    }

    const resultados = [];
    for (const link of links) {
      const sanitized = typeof link === 'string' ? link.split('#')[0] : link;

      const duplicateQuery = `
        SELECT 1 FROM afiliado.link_para_afiliar WHERE link = $1
        UNION ALL
        SELECT 1 FROM afiliado.afiliacoes WHERE link_original = $1
        UNION ALL
        SELECT 1 FROM afiliado.afiliacoes_pendentes WHERE link_original = $1
        LIMIT 1
      `;
      const dupResult = await client.query(duplicateQuery, [sanitized]);

      if (dupResult.rows.length > 0) {
        resultados.push({ link: sanitized, duplicado: true });
        continue;
      }

      const insertQuery = `
        INSERT INTO afiliado.link_para_afiliar (link, nicho, status, chat_telegram)
        VALUES ($1, $2, 'aguardando', $3)
        ON CONFLICT (link) DO NOTHING
        RETURNING id
      `;
      const insertResult = await client.query(insertQuery, [sanitized, nicho, chatTelegram]);

      if (insertResult.rowCount === 0) {
        resultados.push({ link: sanitized, duplicado: true });
      } else {
        resultados.push({ link: sanitized, id: insertResult.rows[0].id, ok: true });
      }
    }

    return { ok: true, resultados };
  }




    if (rota === 'buscarLinkParaAfiliar') {
      const query = `
        SELECT id, link, nicho, status, data_criacao
        FROM afiliado.link_para_afiliar
        WHERE status = 'aguardando'
        ORDER BY data_criacao ASC
        LIMIT 1
      `;
      const result = await client.query(query);
      return result.rows[0];
    }
    if (rota === 'deletarLinkParaAfiliar') {
      const { id } = dados || {};
      const query = 'DELETE FROM afiliado.link_para_afiliar WHERE id = $1 RETURNING id';
      const result = await client.query(query, [id]);
      return result.rows[0];
    }



    async function gerarCodigoUnico(client) {
      let codigo;
      let existe = true;

      while (existe) {
        codigo = gerarCodigoCurto();
        const { rows } = await client.query(
          'SELECT 1 FROM afiliado.afiliacoes WHERE codigo_curto = $1 LIMIT 1',
          [codigo]
        );
        existe = rows.length > 0;
      }

      return codigo;
    }



   if (rota === 'aprovarAfiliacaoPendente') {
    const { id, categorias, subcategoria_id } = dados;

    const selectQuery = 'SELECT * FROM afiliado.afiliacoes_pendentes WHERE id = $1 LIMIT 1';
    const selectResult = await client.query(selectQuery, [id]);

    if (selectResult.rows.length === 0) {
      return { error: 'Afiliacao pendente não encontrada' };
    }

    const pendente = selectResult.rows[0];
    const codigoCurto = await gerarCodigoUnico(client); // 👈 novo código aqui

    const insertQuery = `
      INSERT INTO afiliado.afiliacoes (
        id, nome, descricao, imagem_url, link_afiliado,
        categorias, subcategoria_id, nicho_id,
        origem, preco, cliques, link_original, frete,
        data_criacao, codigo_curto
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8,
        $9, $10, $11, $12, $13,
        $14, $15
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
      pendente.data_criacao,
      codigoCurto 
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

  if (rota === 'salvarSessaoPuppeteer') {
    const { nome, dados: conteudo } = dados || {};
    const query = `
      INSERT INTO automacoes_puppeteer.sessoes (nome, dados)
      VALUES ($1, $2)
      ON CONFLICT (nome) DO UPDATE
        SET dados = EXCLUDED.dados,
            atualizado_em = NOW()
      RETURNING id, nome, dados, atualizado_em, criado_em`;
    const result = await client.query(query, [nome, conteudo]);
    console.log(result, nome, conteudo);
    return result.rows[0];
  }

 if (rota === 'buscarTextoParaGrupo') {
  const { apikey, grupos } = dados || {};
  console.log('[QUERY] Iniciando busca por texto de grupo para a API key:', apikey);

  const nichoQuery = `
    SELECT nichos FROM afiliado.afiliados
    WHERE apikey = $1
    LIMIT 1
  `;
  const nichoResult = await client.query(nichoQuery, [apikey]);

  if (nichoResult.rows.length === 0) {
    console.warn('[QUERY] Nenhum nicho encontrado para a apikey');
    return null;
  }

  const nichos = nichoResult.rows[0].nichos;
  const nichoId = Array.isArray(nichos) ? nichos[0] : nichos;

  //adição de todos os grupos que é admin
  for (const grupo of grupos || []) {
    const { id: identificacao_grupo, nome: nome_grupo, link_convite : link_convite } = grupo;

    // Verifica se o grupo já existe
    const existeQuery = `
      SELECT 1 FROM afiliado.grupo
      WHERE identificacao_grupo = $1
      LIMIT 1
    `;
    const existeResult = await client.query(existeQuery, [identificacao_grupo]);

    if (existeResult.rowCount === 0) {
      // Insere o novo grupo
      const insertGrupoQuery = `
        INSERT INTO afiliado.grupo (
          nome_grupo,
          nicho_grupo,
          identificacao_grupo,
          data_criacao,
          link_convite,
          canal,
          status,
          liberacao_para_mensagem
        ) VALUES (
          $1, $2, $3, CURRENT_TIMESTAMP, $4, NULL, 'ativo', false
        )
      `;
      await client.query(insertGrupoQuery, [
        nome_grupo,
        nichoId,
        identificacao_grupo,
        link_convite
      ]);
      console.log(`[INSERT] Grupo inserido: ${nome_grupo}`);
    } else {
      console.log(`[SKIP] Grupo já existente: ${nome_grupo}`);
    }
  }






  console.log('[QUERY] Nicho selecionado:', nichoId);

  const buscaQuery = `
    SELECT 
      a.id,
      a.nome,
      a.imagem_url,
      a.link_afiliado,
      a.origem,
      a.preco,
      a.frete,
      a.texto_para_grupo,
      b.landingpage,
      a.codigo_curto,
      s."label",
      COALESCE((
        SELECT json_agg(json_build_object(
          'nome_grupo', g.nome_grupo,
          'identificacao_grupo', g.identificacao_grupo,
          'canal', g.canal
        ))
        FROM afiliado.grupo g
        WHERE g.nicho_grupo = a.nicho_id
      ), '[]') AS grupos
    FROM afiliado.afiliacoes a
    JOIN afiliado.subcategorias s ON s.id = a.subcategoria_id
    join afiliado.afiliados b on b.nichos = a.nicho_id
    WHERE a.nicho_id = $1
      AND (a.data_proxima_verificacao <= CURRENT_DATE OR a.data_proxima_verificacao IS NULL)
      AND a.texto_para_grupo IS NOT NULL
      AND a.texto_para_grupo <> ''
      AND a.status_para_grupo = true
      AND a.status_produto = true
    ORDER BY a.data_proxima_verificacao ASC
    LIMIT 1;

  `;
  const buscaResult = await client.query(buscaQuery, [nichoId]);

  if (buscaResult.rows.length === 0) {
    console.log('[QUERY] Nenhum produto disponível no momento para envio');
    return null;
  }

  const registro = buscaResult.rows[0];
  console.log('[QUERY] Produto encontrado:', registro.nome);

  // Montagem do texto final
  const textoBruto = registro.texto_para_grupo;
  const linkCurto = `${registro.landingpage}p/${registro.codigo_curto}`;
  const textoFrete = [
    '(🚚 Aqui consegui *frete grátis*)',
    '(🎉 Deu *frete grátis* pra mim!)',
    '(🛍️ Aqui apareceu com *frete grátis*)',
    '(📦 Deu *frete grátis* aqui!)',
    '(💸 Olha só, aqui rolou *frete grátis*!)'
  ];
  const textosFinais = [
    '🕐 _Oferta por tempo limitado!_',
    '🚨 _Enquanto durar o estoque!_',
    '⏳ _Aproveite antes que acabe..._',
    '🔥 _Últimas unidades! Não perca essa oportunidade._',
    '🕐 _Corre que tá saindo rápido!_',
  ];
  const aleatorio = textosFinais[Math.floor(Math.random() * textosFinais.length)];
  const aleatorio2 = textoFrete[Math.floor(Math.random() * textoFrete.length)];

  const textoFinal = `${textoBruto}\n${aleatorio2}\n\n🛒 Link para comprar:👇\n${linkCurto}\n\n${aleatorio}`;
  registro.texto_para_grupo = textoFinal;

  await client.query(
    `UPDATE afiliado.afiliacoes
    SET data_proxima_verificacao = CURRENT_DATE + INTERVAL '10 days'
    WHERE id = $1`,
    [registro.id]
  );

  console.log('[QUERY] Produto atualizado com nova verificação em 10 dias');
  return registro;
}


  if (rota === 'buscarSessaoPuppeteer') {
    const { nome } = dados || {};
    const query = 'SELECT id, nome, dados, atualizado_em, criado_em FROM automacoes_puppeteer.sessoes WHERE nome = $1 LIMIT 1';
    const result = await client.query(query, [nome]);
    return result.rows[0];
  }

  if (rota === 'buscarUltimoGrupo') {
    const { nicho } = dados || {};
    const query = `
      SELECT link_convite
      FROM afiliado.grupo
      WHERE nicho_grupo = $1
        AND status = 'ativo'
      ORDER BY id DESC
      LIMIT 1
    `;
    const result = await client.query(query, [nicho]);
    return result.rows[0];
  }

  if (rota === 'buscarAfiliacaoSemTexto') {
    const query = `
      SELECT a.id, a.nome, a.descricao, a.preco, a.frete, a.codigo_curto, b.landingpage
      FROM afiliado.afiliacoes a
      JOIN afiliado.afiliados  b on b.nichos = a.nicho_id
      WHERE (texto_para_grupo IS NULL OR texto_para_grupo = '')
      ORDER BY data_criacao ASC
      LIMIT 1
    `;
    const result = await client.query(query);
    return result.rows[0];
  }

  if (rota === 'salvarTextoParaGrupo') {
    const { id, texto } = dados || {};
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);

    const query = `
      UPDATE afiliado.afiliacoes
      SET texto_para_grupo = $2, data_proxima_verificacao = $3
      WHERE id = $1
      RETURNING id, texto_para_grupo
    `;
    const result = await client.query(query, [id, texto,ontem]);
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
