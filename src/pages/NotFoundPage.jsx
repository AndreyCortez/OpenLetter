// src/pages/NotFoundPage.jsx
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center font-mono text-center p-4">
      <div>
        <p>[ erro 404 ]</p>
        <p className="mt-4">
          Página não encontrada.
        </p>
        <p className="mt-2">
          O endereço que você tentou acessar não existe ou foi movido.
        </p>
        <Link 
          to="/" 
          className="block mt-6 underline hover:bg-slate-200"
        >
         Voltar ao início
        </Link>
      </div>
    </div>
  );
}