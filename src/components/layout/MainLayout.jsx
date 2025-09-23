// src/components/layout/MainLayout.jsx
import { Outlet } from 'react-router-dom';
import Header from '../Header'; // Nosso novo Header de navegação

export default function MainLayout() {
  return (
    <div className="max-w-4xl mx-auto px-4 font-sans">
      <Header />
      <main className="py-8">
        <Outlet />
      </main>
    </div>
  );
}