import consultaBd from '../webhook/database';
import { OpenAI } from 'openai';

export default async function handler(req, res) {
  try {
    // busca 1 produto sem texto_para_grupo
    const registro = await consultaBd('buscarAfiliacaoSemTexto');

    if (!registro) {
      return res.status(200).json({ message: 'Nenhuma afiliacao pendente.' });
    }

    if (!process.env.CHAVE_GPT) {
      return res.status(500).json({ error: 'CHAVE_GPT não configurada' });
    }

    const openai = new OpenAI({ apiKey: process.env.CHAVE_GPT });
    const linkCurto = `${registro.codigo_curto}`;

    const prompt = `
      Gere um texto de venda empático e atrativo com até 5 parágrafos curtos. Use emojis.
      [TITULO = NOME]
      [QUEBRA GELO]
      [VALOR]

      Siga o modelo abaixo:
      👕✨ *Kit 5 Bodies Manga Curta*

      Mamãe, sabe aquele body que veste fácil, leve, fresquinho ?
      Esse em suedine 100% algodão é exatamente isso.

      💰 *R$ 29,00*      
      
      Agora crie um texto para este produto:

      ${JSON.stringify({
        nome: registro.nome,
        descricao: registro.descricao,
        preco: registro.preco,
        frete: registro.frete,
      }, null, 2)}

      logo abaixo do preço coloque o seguint texto
      (Aqui deu frete *gratis!*)

      Logo abaixo coloque uma das frases da lista abaixo
      1 - 🕐 Oferta por tempo limitado!
      2 - 🚨 Enquanto durar o estoque! 
      3 - ⏳ Aproveite antes que acabe...
      4 - 🔥 Últimas unidades! Não perca essa oportunidade.
      5 - 🕐 Corre que tá saindo rápido!
      `;

    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    const texto = gptResponse.choices?.[0]?.message?.content?.trim();

    if (texto) {
      await consultaBd('salvarTextoParaGrupo', { id: registro.id, texto });
    }

    return res.status(200).json({ id: registro.id, texto });
  } catch (error) {
    console.error('Erro no cron gerarTextoParaGrupo:', error);
    return res.status(500).json({ error: error.message });
  }
}
