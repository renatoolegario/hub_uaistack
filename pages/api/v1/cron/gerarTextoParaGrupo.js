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

    const prompt = `
      Gere um texto de venda empático e atrativo o modelo abaixo tem que ser curtos. 
      Use emojis.
      O nome deve aparecer apenas no Titulo, no resto não pode aparecer o nome
      Estrutura:
      [TITULO = NOME]
      [QUEBRA GELO] <-- aqui não repita o nome do produto (não pode ser longo, tem que ser curto e direto)
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
      Não deve conter mais nenhum texto abaixo
      `;

    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

 
    const textoBruto = gptResponse.choices?.[0]?.message?.content?.trim();
    
   

    if (textoBruto) {
      await consultaBd('salvarTextoParaGrupo', { id: registro.id, texto: textoBruto });
    }

    return res.status(200).json({ id: registro.id, texto: textoBruto });
  } catch (error) {
    console.error('Erro no cron gerarTextoParaGrupo:', error);
    return res.status(500).json({ error: error.message });
  }
}

