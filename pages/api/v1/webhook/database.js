import { createPool } from '@vercel/postgres';

async function query(rota, dados) {
    if (!process.env.POSTGRES_URL) {
      return { error: 'Variável de ambiente POSTGRES_URL não definida' };
    }

   const cliente = createPool({
      connectionString: process.env.POSTGRES_URL,
    });
    

    try {

        const pool = await cliente.connect();

          if (rota === 'auth') {
            try {
              const { auth, remetente } = dados;
             
              // Consulta: verificar se existe um usuário com o email e senha informados
                  const query = 'SELECT 1 FROM auth.apikeys WHERE apikey = $1 AND description = $2 LIMIT 1';
      const result = await db.query(query, [auth, remetente]);
      return result.rows.length > 0;
            } catch (error) {
              console.error('Erro ao autenticar usuário:', error);
              return { error: `Erro interno do servidor - ${error.message}` };
            }
          }

          

      return { error: 'Rota não encontrada' , dados};
    } catch (error) {
      console.error('Erro ao executar a consulta:', error);
      return { error: `Erro interno do servidor - ${error.message}` };
    }
}
  
  
async function consulta(rota, dados) {
  try {
    const resultado = await query(rota, dados);
    return resultado;
  } catch (error) {
    console.error('Erro na consulta:', error);
    throw error; // Rejogue o erro para que ele seja capturado pelo caller (quem chama a função)
  }
}

export default consulta;