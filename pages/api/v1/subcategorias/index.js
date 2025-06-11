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
}
