// src/components/Header.jsx
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');
  let userEmail = null;

  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      userEmail = decodedToken.email; 
    } catch (error) {
      console.error("Token inválido ou expirado:", error);
      localStorage.removeItem('authToken');
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/'; 
  };

  const navLinkClasses = ({ isActive }) =>
    `hover:underline ${isActive ? 'underline' : ''}`;

  return (
    <header className="py-4 border-b border-slate-300 flex justify-between items-center">
      <div className="flex items-center gap-6">
        <NavLink to="/" className="hover:underline">
          OpenLetters Archive
        </NavLink>
        <nav className="flex items-center gap-4">
          <NavLink to="/" className={navLinkClasses}>Início</NavLink>
          <NavLink to="/escrever" className={navLinkClasses}>Escrever</NavLink>
          <NavLink to="/pesquisar" className={navLinkClasses}>Pesquisar</NavLink>
        </nav>
      </div>
      
      <div className="font-mono">
        {userEmail ? (
          <span>
            {userEmail} (<button onClick={handleLogout} className="underline">Sair</button>)
          </span>
        ) : (
          <div className="flex gap-3">
            <Link to="/login" className="underline">Entrar</Link>
            <Link to="/registro" className="underline">Registrar</Link>
          </div>
        )}
      </div>
    </header>
  );
}