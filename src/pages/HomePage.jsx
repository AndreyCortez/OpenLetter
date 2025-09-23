// src/pages/HomePage.jsx
import LetterListItem from '../components/LetterListItem';

export default function HomePage() {
  const letters = [
    { id: 1, from: 'ana.silva.num.email.muito.longo.mesmo@example.com', to: 'ceo@techcorp.com', subject: 'Pelo Futuro do Trabalho Remoto', signatureCount: 1254, time: '2025-09-23 14:30' },
    { id: 2, from: 'bruno.costa@email.com', to: 'gabinete.secretaria.planejamento.urbano@cidadelegal.gov.br', subject: 'Mais Ciclovias na Avenida Principal', signatureCount: 872, time: '2025-09-22 10:15' },
    { id: 3, from: 'carla.mendes@email.com', to: 'contato@universidade.edu', subject: 'Revisão das Taxas da Cantina', signatureCount: 3109, time: '2025-09-20 18:00' },
  ];

  return (
    <div>
      <div className="border border-slate-300">
        {letters.map((letter) => (
          <LetterListItem key={letter.id} {...letter} />
        ))}
      </div>
    </div>
  );
}