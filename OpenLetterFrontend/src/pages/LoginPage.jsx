// src/pages/LoginPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axios';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // PONTO-CHAVE: Fazendo a chamada POST para a API de login
      const response = await apiClient.post('/users/login', { email, password });
      
      // PONTO-CHAVE: Armazena o token recebido no localStorage do navegador
      if (response.data && response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        // Redireciona o usuário para a página inicial com um refresh
        window.location.href = '/';
      } else {
        setError('Resposta de login inválida do servidor.');
      }
    } catch (err) {
      console.error(err);
      setError('Email ou senha inválidos.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = "w-full p-2 border border-slate-300 bg-white focus:outline-none focus:border-slate-500";

  return (
    <div className="min-h-screen flex items-center justify-center font-mono">
      <div className="max-w-md w-full p-6">
        <h1 className="text-2xl text-center mb-6">Entrar</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email" id="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputStyle} required
            />
          </div>
          <div>
            <label htmlFor="password">Senha</label>
            <input
              type="password" id="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputStyle} required
            />
          </div>
          {error && <p className="text-red-600">{error}</p>}
          <div>
            <button type="submit" className="w-full underline p-2 hover:bg-slate-200" disabled={isLoading}>
              {isLoading ? 'Entrando...' : '> Entrar'}
            </button>
          </div>
        </form>
        <p className="text-center mt-4">
          Não tem uma conta? <Link to="/registro" className="underline">Criar uma</Link>
        </p>
      </div>
    </div>
  );
}