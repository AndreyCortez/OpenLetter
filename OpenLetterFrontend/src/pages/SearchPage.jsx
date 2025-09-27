// src/pages/SearchPage.jsx
import { useState } from 'react';
import apiClient from '../api/axios';
import LetterListItem from '../components/LetterListItem';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [searchField, setSearchField] = useState('subject');
  const [sortOrder, setSortOrder] = useState('desc');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const inputStyle = "w-full p-2 border border-slate-300 bg-white focus:outline-none focus:border-slate-500";
  const selectStyle = "py-2 pl-3 pr-8 border border-slate-300 bg-white focus:outline-none focus:border-slate-500";

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    const params = new URLSearchParams({
      field: searchField,
      query: query,
      sortOrder: sortOrder,
    });
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    try {
      const response = await apiClient.get(`/letters?${params.toString()}`);
      
      const mappedResults = response.data.map(letter => ({
        ...letter,
        from: letter.senderEmail,
        to: letter.recipient_email,
        signatureCount: letter.signatureCount,
        time: new Date(letter.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      }));
      
      setResults(mappedResults);
    } catch (err) {
      console.error("Erro ao buscar cartas:", err);
      setError("Não foi possível carregar os resultados. Tente novamente mais tarde.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1>Pesquisar Cartas</h1>
      
      <form onSubmit={handleSearch} className="flex flex-col gap-4 mt-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-2">
          <select 
            name="searchField" 
            value={searchField} 
            onChange={(e) => setSearchField(e.target.value)}
            className={selectStyle}
          >
            <option value="subject">Título</option>
            <option value="from">Remetente</option>
            <option value="to">Destinatário</option>
          </select>
          <input
            type="search"
            name="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`${inputStyle} w-full`}
            placeholder="Digite para pesquisar..."
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 items-end">
            <div className="flex-1 w-full">
                <label htmlFor="startDate" className="block text-sm mb-1">De:</label>
                <input 
                    type="date" 
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={inputStyle}
                />
            </div>
            <div className="flex-1 w-full">
                <label htmlFor="endDate" className="block text-sm mb-1">Até:</label>
                <input 
                    type="date" 
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={inputStyle}
                />
            </div>
            <div className="w-full sm:w-auto">
                <button type="submit" className="underline hover:bg-slate-200 p-2 w-full" disabled={isLoading}>
                    {isLoading ? "Buscando..." : "> Pesquisar"}
                </button>
            </div>
        </div>
      </form>

      <div>
        {hasSearched && (
          <div className="flex justify-between items-center mb-4">
            <h2>Resultados da Busca</h2>
            {results.length > 0 && !isLoading && (
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

        {isLoading && <p>Carregando resultados...</p>}
        {error && <p className="text-red-600">{error}</p>}
        
        {!isLoading && !error && hasSearched && (
          results.length > 0 ? (
            <div className="border border-slate-300">
              {results.map(letter => (
                <LetterListItem key={letter.id} {...letter} />
              ))}
            </div>
          ) : (
            <p>Nenhuma carta encontrada para sua busca.</p>
          )
        )}
      </div>
    </div>
  );
}