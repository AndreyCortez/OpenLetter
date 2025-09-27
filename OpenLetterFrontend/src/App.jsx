// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import WritePage from './pages/WritePage';
import SearchPage from './pages/SearchPage';
import NotFoundPage from './pages/NotFoundPage';
import LetterPage from './pages/LetterPage';
import RegisterPage from './pages/RegisterPage'; 
import LoginPage from './pages/LoginPage';    

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="escrever" element={<WritePage />} />
        <Route path="pesquisar" element={<SearchPage />} />
        <Route path="carta/:id" element={<LetterPage />} />
      </Route>
      
      <Route path="/registro" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;