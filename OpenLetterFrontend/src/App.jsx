import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import WritePage from './pages/WritePage';
import SearchPage from './pages/SearchPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Routes>
      {/* Todas as rotas dentro de MainLayout terão a sidebar */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="escrever" element={<WritePage />} />
        <Route path="pesquisar" element={<SearchPage />} />
        {/* Adicione outras rotas aqui, ex: /carta/:id */}
      </Route>

      {/* Rota para páginas sem a sidebar (ex: login, ou página 404) */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;