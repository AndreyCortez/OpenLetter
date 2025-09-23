// src/components/LetterListItem.jsx
import { Link } from 'react-router-dom'; // Importamos o Link para uma navegação correta

export default function LetterListItem({ id, from, to, subject, signatureCount, time }) {
  // Componente auxiliar para evitar repetição de código
  const EmailDisplay = ({ label, email }) => (
    <div className="truncate max-w-[200px] sm:max-w-xs md:max-w-sm">
      <span>{label}: </span>
      <span title={email}>{email}</span>
    </div>
  );
  
  return (
    // Removemos a tag <a> que envolvia tudo
    <div className="p-3 border-b border-slate-300 last:border-b-0 hover:bg-slate-100 transition-colors duration-150">
      
      <div className="flex flex-col sm:flex-row sm:justify-between">
        <span className="truncate">{subject}</span>
        <span className="flex-shrink-0 order-first sm:order-last">[{time}]</span>
      </div>
      
      <div className="mt-1">
        <EmailDisplay label="De" email={from} />
        <EmailDisplay label="Para" email={to} />
      </div>
      
      {/* Nova seção inferior com flexbox */}
      <div className="mt-2 flex justify-between items-center">
        <span>Assinaturas: {signatureCount}</span>
        
        {/* Usamos o componente Link para a navegação da SPA */}
        <Link 
          to={`/carta/${id}`} 
          className="underline hover:text-black"
          // Impede que o clique no link propague para outros elementos
          onClick={(e) => e.stopPropagation()}
        >
          Ler
        </Link>
      </div>
    </div>
  );
}