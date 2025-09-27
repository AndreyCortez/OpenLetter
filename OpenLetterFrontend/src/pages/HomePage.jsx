// src/pages/HomePage.jsx
import { useState, useEffect } from 'react';
import apiClient from '../api/axios';
import LetterListItem from '../components/LetterListItem';

export default function HomePage() {
  const [letters, setLetters] = useState([]);
  const [timeRange, setTimeRange] = useState('all'); // 'day', 'week', 'month', 'year', 'all'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopLetters = async () => {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        sortOrder: 'desc', // Sempre buscar pelas mais assinadas
      });

      // Lógica para calcular as datas com base no timeRange selecionado
      if (timeRange !== 'all') {
        const endDate = new Date();
        let startDate = new Date();

        if (timeRange === 'day') {
          // O dia de hoje
        } else if (timeRange === 'week') {
          startDate.setDate(endDate.getDate() - 7);
        } else if (timeRange === 'month') {
          startDate.setMonth(endDate.getMonth() - 1);
        } else if (timeRange === 'year') {
          startDate.setFullYear(endDate.getFullYear() - 1);
        }
        
        // Formata as datas para o formato YYYY-MM-DD que a API espera
        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = endDate.toISOString().split('T')[0];

        params.append('startDate', formattedStartDate);
        params.append('endDate', formattedEndDate);
      }
      
      try {
        const response = await apiClient.get(`/letters?${params.toString()}`);
        
        const mappedResults = response.data.map(letter => ({
          ...letter,
          from: letter.senderEmail,
          to: letter.recipient_email,
          signatureCount: letter.signatureCount,
          time: new Date(letter.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        }));
        
        setLetters(mappedResults);
      } catch (err) {
        console.error("Erro ao buscar cartas populares:", err);
        setError("Não foi possível carregar as cartas. Tente novamente.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopLetters();
  }, [timeRange]); // Re-executa a busca quando o timeRange muda

  const TimeRangeButton = ({ range, label }) => (
    <button
      onClick={() => setTimeRange(range)}
      className={`p-2 hover:bg-slate-200 ${timeRange === range ? 'underline' : ''}`}
      disabled={isLoading}
    >
      {label}
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
        <h1>Cartas Mais Populares</h1>
        <div className="flex gap-2 flex-wrap">
          <TimeRangeButton range="day" label="Hoje" />
          <TimeRangeButton range="week" label="Semana" />
          <TimeRangeButton range="month" label="Mês" />
          <TimeRangeButton range="year" label="Ano" />
          <TimeRangeButton range="all" label="Sempre" />
        </div>
      </div>
      
      {isLoading && <p>Carregando cartas...</p>}
      
      {error && <p className="text-red-600">{error}</p>}

      {!isLoading && !error && (
        letters.length > 0 ? (
          <div className="border border-slate-300">
            {letters.map(letter => (
              <LetterListItem key={letter.id} {...letter} />
            ))}
          </div>
        ) : (
          <p>Nenhuma carta encontrada para este período.</p>
        )
      )}
    </div>
  );
}