import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CARProvider } from './context/CARContext';
import { LanguageProvider, useT } from './context/LanguageContext';
import { Header } from './components/Header';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { CreateCAR } from './pages/CreateCAR';
import { CARDetail } from './pages/CARDetail';
import { UserManagement } from './pages/UserManagement';

function AppInner() {
  const t = useT();
  const { currentUser, loading } = useAuth();
  const [page, setPage] = useState('dashboard');
  const [selectedCarId, setSelectedCarId] = useState(null);

  const navigate = (target, carId = null) => {
    setPage(target);
    setSelectedCarId(carId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading…</div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <CARProvider>
      <div className="min-h-screen bg-slate-100">
        <Header onNavigate={navigate} />
        <main className="py-2">
          {page === 'dashboard' && <Dashboard onNavigate={navigate} />}
          {page === 'create'    && <CreateCAR onNavigate={navigate} />}
          {page === 'detail'    && <CARDetail carId={selectedCarId} onNavigate={navigate} />}
          {page === 'users'     && <UserManagement onNavigate={navigate} />}
        </main>
        <footer className="text-center text-xs text-gray-400 py-6 border-t border-gray-200 bg-white mt-8">
          {t('app', 'footer')} · {new Date().getFullYear()}
        </footer>
      </div>
    </CARProvider>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </LanguageProvider>
  );
}
