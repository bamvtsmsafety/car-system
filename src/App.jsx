import { useState } from 'react';
import { CARProvider } from './context/CARContext';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { CreateCAR } from './pages/CreateCAR';
import { CARDetail } from './pages/CARDetail';

function AppInner() {
  const [page, setPage] = useState('dashboard');
  const [selectedCarId, setSelectedCarId] = useState(null);

  const navigate = (target, carId = null) => {
    setPage(target);
    setSelectedCarId(carId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Header onNavigate={navigate} />
      <main className="py-2">
        {page === 'dashboard' && <Dashboard onNavigate={navigate} />}
        {page === 'create' && <CreateCAR onNavigate={navigate} />}
        {page === 'detail' && <CARDetail carId={selectedCarId} onNavigate={navigate} />}
      </main>
      <footer className="text-center text-xs text-gray-400 py-6 border-t border-gray-200 bg-white mt-8">
        Airport Safety Management System · Corrective Action Request (CAR) System · {new Date().getFullYear()}
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <CARProvider>
      <AppInner />
    </CARProvider>
  );
}
