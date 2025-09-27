// src/components/Header.jsx
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from './Icons';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const userEmail = "helena.gomes@email.com"; // Simulação

  const navLinkClasses = ({ isActive }) =>
    `block py-2 hover:underline ${isActive ? 'underline' : ''}`;

  return (
    <header className="py-4 border-b border-slate-300 flex justify-between items-center">
      {/* Logo e Navegação Desktop */}
      <div className="flex items-center gap-6">
        <NavLink to="/" className="hover:underline" onClick={() => setIsMenuOpen(false)}>
          OpenLetters Archive
        </NavLink>
        {/* Navegação visível apenas em telas médias e maiores */}
        <nav className="hidden md:flex items-center gap-4">
          <NavLink to="/" className={navLinkClasses}>Início</NavLink>
          <NavLink to="/escrever" className={navLinkClasses}>Escrever</NavLink>
          <NavLink to="/pesquisar" className={navLinkClasses}>Pesquisar</NavLink>
        </nav>
      </div>

      {/* Seção do Usuário */}
      <div className="hidden md:block">
        {userEmail ? (
          <span>{userEmail} (<button className="underline">Sair</button>)</span>
        ) : (
          <div className="flex gap-3">
            <button className="underline">Login</button>
            <button className="underline">Registrar</button>
          </div>
        )}
      </div>

      {/* Botão Hamburger (visível apenas em telas pequenas) */}
      <div className="md:hidden">
        <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <XMarkIcon /> : <Bars3Icon />}
        </button>
      </div>

      {/* Menu Slide-in Mobile */}
      <div
        className={`
          md:hidden fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-300 z-20
          transform transition-transform duration-300 ease-in-out
          ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-4">
            <button onClick={() => setIsMenuOpen(false)} className="absolute top-4 right-4">
                <XMarkIcon />
            </button>
            <h2 className="font-bold mb-6 mt-2">Navegação</h2>
            <nav className="flex flex-col gap-4">
                <NavLink to="/" className={navLinkClasses} onClick={() => setIsMenuOpen(false)}>Início</NavLink>
                <NavLink to="/escrever" className={navLinkClasses} onClick={() => setIsMenuOpen(false)}>Escrever</NavLink>
                <NavLink to="/pesquisar" className={navLinkClasses} onClick={() => setIsMenuOpen(false)}>Pesquisar</NavLink>
            </nav>

            <div className="border-t border-slate-300 mt-6 pt-4">
                 {userEmail ? (
                    <div>
                        <p>{userEmail}</p>
                        <button className="underline mt-2">Sair</button>
                    </div>
                ) : (
                    <div className="flex flex-col items-start gap-3">
                        <button className="underline">Login</button>
                        <button className="underline">Registrar</button>
                    </div>
                )}
            </div>
        </div>
      </div>
    </header>
  );
}