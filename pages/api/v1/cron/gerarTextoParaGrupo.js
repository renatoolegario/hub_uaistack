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

    const prompt =
      `Gere um texto de venda empático e atrativo com até 5 parágrafos curtos,  com base nesse produto:\n` +
      JSON.stringify({
        nome: registro.nome,
        descricao: registro.descricao,
        preco: registro.preco,
        frete: registro.frete,
        link_curto: linkCurto,
      }, null, 2) +
      `\n\nFinalize com um botão de CTA assim, o [LINK] é harded code vai ser exatamete esse texto:\n\n🛒 [QUERO ESSE PRODUTO AGORA!]\n [LINK]`;

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
