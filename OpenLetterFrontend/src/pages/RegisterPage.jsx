// src/pages/RegisterPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axios';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (password) => {
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const isLongEnough = password.length >= 8;

    if (!hasUppercase || !hasLowercase || !hasNumber || !isLongEnough) {
      setError("A senha deve ter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas e números.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirm) {
      setError("As senhas não coincidem.");
      return;
    }
    if (!validatePassword(password)) {
      return;
    }
    
    setIsLoading(true);

    try {
      // Passo 1: Tenta registrar o usuário
      await apiClient.post('/users/register', { email, password });
      
      // Passo 2: Se o registro for bem-sucedido, tenta fazer o login automaticamente
      const loginResponse = await apiClient.post('/users/login', { email, password });

      // Passo 3: Armazena o token e redireciona
      if (loginResponse.data && loginResponse.data.token) {
        localStorage.setItem('authToken', loginResponse.data.token);
        window.location.href = '/'; // Redireciona para a home, já logado
      } else {
        throw new Error("Resposta de login inválida do servidor.");
      }

    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Este email já está em uso ou ocorreu um erro no processo.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const inputStyle = "w-full p-2 border border-slate-300 bg-white focus:outline-none focus:border-slate-500";

  return (
    <div className="min-h-screen flex items-center justify-center font-mono">
      <div className="max-w-md w-full p-6">
        <h1 className="text-2xl text-center mb-6">Criar Conta</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ... os campos do formulário permanecem os mesmos ... */}
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
          <div>
            <label htmlFor="passwordConfirm">Repetir Senha</label>
            <input
              type="password" id="passwordConfirm" value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className={inputStyle} required
            />
          </div>
          
          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div>
            <button type="submit" className="w-full underline p-2 hover:bg-slate-200" disabled={isLoading}>
              {isLoading ? 'Criando conta...' : '> Criar Conta'}
            </button>
          </div>
        </form>
        <p className="text-center mt-4">
          Já tem uma conta? <Link to="/login" className="underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
}