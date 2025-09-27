import { NavLink } from 'react-router-dom';
import { PencilSquareIcon, HomeIcon, MagnifyingGlassIcon } from './Icons';

export default function Sidebar() {
  const userEmail = "helena.gomes@email.com"; // Simulação

  const navLinkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2 rounded-md font-medium transition-colors ${
      isActive
        ? 'bg-slate-200 text-slate-900'
        : 'text-slate-600 hover:bg-slate-100'
    }`;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-800">Cartas Abertas</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <NavLink to="/escrever" className="flex items-center gap-3 px-4 py-2 text-white bg-blue-600 rounded-md font-semibold hover:bg-blue-700">
          <PencilSquareIcon />
          Escrever Carta
        </NavLink>
        <NavLink to="/" className={navLinkClasses}>
          <HomeIcon />
          Início
        </NavLink>
        <NavLink to="/pesquisar" className={navLinkClasses}>
          <MagnifyingGlassIcon />
          Pesquisar
        </NavLink>
      </nav>
      <div className="p-6 border-t border-slate-200">
        {userEmail ? (
          <div>
            <p className="text-sm text-slate-500">Logado como:</p>
            <p className="font-semibold text-slate-800 truncate">{userEmail}</p>
            <button className="w-full mt-3 text-left text-sm text-red-600 font-medium hover:underline">
              Sair
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <button className="w-full bg-slate-800 text-white font-bold py-2 px-4 rounded-md hover:bg-slate-900">Login</button>
            <button className="w-full border border-slate-300 text-slate-800 font-bold py-2 px-4 rounded-md hover:bg-slate-100">Registrar</button>
          </div>
        )}
      </div>
    </aside>
  );
}