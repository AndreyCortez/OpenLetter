// src/pages/SearchPage.jsx
import { useState, useEffect } from 'react';
import LetterListItem from '../components/LetterListItem';

// Dados de exemplo para simular um banco de dados
const allLetters = [
    { id: 1, from: 'ana.silva@email.com', to: 'ceo@techcorp.com', subject: 'Pelo Futuro do Trabalho Remoto', signatureCount: 1254, time: '2025-09-23 14:30' },
    { id: 2, from: 'bruno.costa@email.com', to: 'prefeitura@cidadelegal.gov.br', subject: 'Mais Ciclovias na Avenida Principal', signatureCount: 872, time: '2025-09-22 10:15' },
    { id: 3, from: 'carla.mendes@email.com', to: 'contato@universidade.edu', subject: 'Revisão das Taxas da Cantina', signatureCount: 3109, time: '2025-09-20 18:00' },
    { id: 4, from: 'ana.silva@email.com', to: 'cultura@estado.gov.br', subject: 'Apoio ao Teatro Local', signatureCount: 450, time: '2025-09-19 11:00' },
    { id: 5, from: 'daniel.rocha@email.com', to: 'ceo@techcorp.com', subject: 'Sugestão de melhoria na intranet', signatureCount: 15, time: '2025-09-18 09:45' },
];

export default function SearchPage() {
  // Estados para controlar os inputs do usuário
  const [query, setQuery] = useState('');
  const [searchField, setSearchField] = useState('subject'); // 'subject', 'from', ou 'to'
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' ou 'asc'

  // Estados para controlar os resultados
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Estilo base para os campos de input e select
  // Depois
    const inputStyle = "p-2 border border-slate-300 bg-white focus:outline-none focus:border-slate-500";
    const selectStyle = "py-2 pl-3 pr-8 border border-slate-300 bg-white focus:outline-none focus:border-slate-500";

  // Função que executa a busca quando o formulário é enviado
  const handleSearch = (e) => {
    e.preventDefault();
    setHasSearched(true);
    
    if (!query) {
      setResults([]);
      return;
    }

    // 1. Filtra as cartas com base na busca
    const filtered = allLetters.filter(letter => 
      letter[searchField].toLowerCase().includes(query.toLowerCase())
    );

    // 2. Ordena os resultados filtrados
    const sorted = [...filtered].sort((a, b) => {
      if (sortOrder === 'desc') {
        return b.signatureCount - a.signatureCount;
      }
      return a.signatureCount - b.signatureCount;
    });

    setResults(sorted);
  };

  // Este useEffect re-ordena os resultados se o usuário mudar a ordem
  // DEPOIS de já ter feito uma busca.
  useEffect(() => {
    if (results.length > 0) {
      const reSorted = [...results].sort((a, b) => {
        if (sortOrder === 'desc') {
          return b.signatureCount - a.signatureCount;
        }
        return a.signatureCount - b.signatureCount;
      });
      setResults(reSorted);
    }
  }, [sortOrder]); // Roda apenas quando `sortOrder` muda

  return (
    <div className="max-w-4xl mx-auto">
      <h1>Pesquisar Cartas</h1>
      
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 mt-4 mb-8 ">
        <select 
          name="searchField" 
          value={searchField} 
          onChange={(e) => setSearchField(e.target.value)}
          className={selectStyle}
        >
          <option value="subject">Título  </option>
          <option value="from">Remetente  </option>
          <option value="to">Destinatário  </option>
        </select>
        
        <input
          type="search"
          name="query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`${inputStyle} w-full`}
          placeholder="Digite para pesquisar..."
        />
        
        <button type="submit" className="underline hover:bg-slate-200 p-2 flex-shrink-0">
         Pesquisar
        </button>
      </form>

      {/* Seção de Resultados */}
      <div>
        {hasSearched && (
          <div className="flex justify-between items-center mb-4">
            <h2>Resultados da Busca</h2>
            {results.length > 0 && (
              <select 
                name="sortOrder" 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className={selectStyle}
              >
                <option value="desc">Mais assinadas</option>
                <option value="asc">Menos assinadas</option>
              </select>
            )}
          </div>
        )}

        {/* Lógica de exibição dos resultados */}
        {hasSearched ? (
          results.length > 0 ? (
            <div className="border border-slate-300">
              {results.map(letter => (
                <LetterListItem key={letter.id} {...letter} />
              ))}
            </div>
          ) : (
            <p>Nenhuma carta encontrada para sua busca.</p>
          )
        ) : (
          <p>Faça uma busca para ver os resultados.</p>
        )}
      </div>
    </div>
  );
}