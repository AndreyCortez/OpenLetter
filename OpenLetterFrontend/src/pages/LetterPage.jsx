// src/pages/LetterPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';

export default function LetterPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [letter, setLetter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const isLoggedIn = !!localStorage.getItem('authToken');

  useEffect(() => {
    const fetchLetter = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(`/letters/${id}`);
        setLetter(response.data);
      } catch (err) {
        console.error("Erro ao buscar a carta:", err);
        if (err.response && err.response.status === 404) {
          setError("Carta não encontrada.");
        } else {
          setError("Não foi possível carregar a carta. Tente novamente.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchLetter();
  }, [id]);

  const handleToggleSignature = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    try {
      const response = await apiClient.post(`/letters/${id}/toggle-signature`);
      
      setLetter(prevLetter => ({
        ...prevLetter,
        isSigned: response.data.signed,
        signatureCount: response.data.signatureCount,
      }));
    } catch (err) {
      console.error("Erro ao assinar a carta:", err);
      if (err.response && err.response.status === 401) {
        alert("Sua sessão expirou. Por favor, faça o login novamente.");
        localStorage.removeItem('authToken');
        navigate('/login');
      } else {
        alert("Ocorreu um erro ao processar sua assinatura. Tente novamente.");
      }
    }
  };

  if (isLoading) {
    return <p className="max-w-4xl mx-auto">Carregando carta...</p>;
  }

  if (error) {
    return <p className="max-w-4xl mx-auto text-red-600">{error}</p>;
  }

  if (!letter) {
    return <p className="max-w-4xl mx-auto">Nenhuma carta para exibir.</p>;
  }

  const formattedDate = new Date(letter.created_at).toLocaleString('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'short'
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link to="/" className="underline hover:bg-slate-200">
          &lt; Voltar para o arquivo
        </Link>
      </div>

      <div className="border border-slate-300 p-4 sm:p-6">
        <header className="border-b border-slate-300 pb-4 mb-4">
          <h1 className="text-xl mb-2">{letter.subject}</h1>
          <div className="text-sm">
            <p><strong>De:</strong> {letter.senderEmail}</p>
            <p><strong>Para:</strong> {letter.recipient_email}</p>
            <p><strong>Data:</strong> {formattedDate}</p>
          </div>
        </header>

        <main className="whitespace-pre-wrap">
          {letter.body}
        </main>

        <footer className="border-t border-slate-300 pt-4 mt-6 flex justify-between items-center">
          <span className="font-bold">
            Assinaturas: {letter.signatureCount}
          </span>
          {isLoggedIn && (
            <button onClick={handleToggleSignature} className="underline hover:bg-slate-200 p-2">
              {letter.isSigned ? '> Retirar Assinatura' : '> Assinar esta carta'}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}