
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const categorias = [
    {
      id: 1,
      nome: 'Tecnologia',
      subcategorias: [
        { id: 1, nome: 'Computadores' },
        { id: 2, nome: 'Celulares' },
      ],
    },
    {
      id: 2,
      nome: 'Casa',
      subcategorias: [
        { id: 3, nome: 'Móveis' },
        { id: 4, nome: 'Decoração' },
      ],
    },
  ];

  const subcategorias = [];
  categorias.forEach((cat) => {
    cat.subcategorias.forEach((sub) => {
      subcategorias.push({
        id: sub.id,
        nome: sub.nome,
        categoria: { id: cat.id, nome: cat.nome },
      });
    });
  });

  return res.status(200).json({ subcategorias });
import { createPool } from '@vercel/postgres';

const pool = createPool({
  connectionString: process.env.POSTGRES_URL,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nome, categoria_id } = req.body || {};

  if (!nome || !categoria_id) {
    return res.status(400).json({ error: 'nome e categoria_id são obrigatórios' });
  }

  if (!process.env.POSTGRES_URL) {
    return res.status(500).json({ error: 'Variável de ambiente POSTGRES_URL não definida' });
  }

  try {
    const client = await pool.connect();
    try {
      const query = 'INSERT INTO afiliado.subcategorias (nome, categoria_id) VALUES ($1, $2) RETURNING id, nome, categoria_id;';
      const result = await client.query(query, [nome, categoria_id]);
      return res.status(201).json({ subcategoria: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao cadastrar subcategoria:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
