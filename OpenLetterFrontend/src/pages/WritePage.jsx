// src/pages/WritePage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import { jwtDecode } from 'jwt-decode';

export default function WritePage() {
  const [formData, setFormData] = useState({
    recipient: '',
    subject: '',
    body: '',
  });
  const [loggedInUserEmail, setLoggedInUserEmail] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Efeito para verificar a autenticação e buscar o email do usuário
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      // Se não há token, redireciona para o login
      navigate('/login');
      return;
    }

    try {
      // Se há token, decodifica para pegar o email
      const decodedToken = jwtDecode(token);
      setLoggedInUserEmail(decodedToken.email);
    } catch (error) {
      console.error("Token inválido:", error);
      // Se o token for inválido, limpa e redireciona
      localStorage.removeItem('authToken');
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        recipient: formData.recipient,
        subject: formData.subject,
        body: formData.body,
      };
      
      await apiClient.post('/letters', payload);
      
      alert('Carta enviada com sucesso!');
      navigate('/'); // Redireciona para a página inicial após o envio
      
    } catch (err) {
      console.error("Erro ao criar carta:", err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error); // Mostra o erro da API (ex: cooldown)
      } else {
        setError('Ocorreu um erro ao enviar a carta. Verifique sua conexão.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = "w-full p-2 border border-slate-300 bg-white focus:outline-none focus:border-slate-500";
  const disabledInputStyle = "w-full p-2 border border-slate-200 bg-slate-100";

  // Não renderiza o formulário até que o email do usuário seja carregado
  if (!loggedInUserEmail) {
    return <p className="max-w-4xl mx-auto">Verificando autenticação...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1>Escrever Nova Carta</h1>
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div>
          <label htmlFor="sender" className="block mb-1">Remetente</label>
          <input
            type="email"
            id="sender"
            name="sender"
            value={loggedInUserEmail}
            className={disabledInputStyle}
            disabled
          />
        </div>
        
        <div>
          <label htmlFor="recipient" className="block mb-1">Destinatário</label>
          <input
            type="email"
            id="recipient"
            name="recipient"
            value={formData.recipient}
            onChange={handleChange}
            className={inputStyle}
            required
            placeholder="email@destinatario.com"
          />
        </div>

        <div>
          <label htmlFor="subject" className="block mb-1">Título</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className={inputStyle}
            required
            placeholder="Assunto da carta"
          />
        </div>

        <div>
          <label htmlFor="body" className="block mb-1">Corpo</label>
          <textarea
            id="body"
            name="body"
            value={formData.body}
            onChange={handleChange}
            className={inputStyle}
            rows="12"
            required
            placeholder="Escreva sua carta aqui..."
          />
        </div>
        
        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div>
          <button 
            type="submit" 
            className="underline hover:bg-slate-200 p-2"
            disabled={isLoading}
          >
            {isLoading ? 'Enviando...' : '> Enviar Carta'}
          </button>
        </div>
      </form>
    </div>
  );
}