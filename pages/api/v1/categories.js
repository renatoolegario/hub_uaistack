export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Lista estática de categorias. Substitua por consulta ao banco se necessário.
  const categories = [
    'Tecnologia',
    'Educação',
    'Saúde',
    'Entretenimento',
    'Negócios'
  ];

  res.status(200).json({ categories });
}
