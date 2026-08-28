import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from './firebase';
import AuthModal from './components/AuthModal';
import Header from './components/Header';
import Calendar from './components/Calendar';
import Dashboard from './components/Dashboard';
import AddRefuelModal from './components/AddRefuelModal';
import AnalyticsModal from './components/AnalyticsModal';
import StationManagerModal from './components/StationManagerModal';
import { Plus } from 'lucide-react';

// Функция для форматирования даты в YYYY-MM-DD без сдвига UTC
const formatDateForInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showStationManager, setShowStationManager] = useState(false);
  const [records, setRecords] = useState([]);
  const [stations, setStations] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  // Теперь selectedDate хранит строку в формате YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState(formatDateForInput(new Date()));

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setRecords([]);
      setStations([]);
      return;
    }

    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    const logsQuery = query(
      collection(db, 'users', user.uid, 'logs'),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    );

    const unsubLogs = onSnapshot(logsQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date, // Firestore Timestamp
      }));
      setRecords(docs);
    }, (error) => {
      console.error('Ошибка загрузки записей:', error);
    });

    const stationsQuery = query(collection(db, 'users', user.uid, 'stations'));
    const unsubStations = onSnapshot(stationsQuery, (snapshot) => {
      setStations(snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })));
    }, (error) => {
      console.error('Ошибка загрузки станций:', error);
    });

    return () => {
      unsubLogs();
      unsubStations();
    };
  }, [user, currentMonth, currentYear]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDayClick = (day) => {
    const dateObj = new Date(currentYear, currentMonth, day);
    setSelectedDate(formatDateForInput(dateObj));
    setShowAddModal(true);
  };

  const handleDeleteRecord = async (recordId) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'logs', recordId));
    } catch (error) {
      console.error('Ошибка удаления записи:', error);
    }
  };

  const handleDeleteStation = async (stationId) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'stations', stationId));
    } catch (error) {
      console.error('Ошибка удаления АЗС:', error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] space-y-4 pb-20">
        <Header user={user} onAuthClick={() => setShowAuthModal(true)} />

        {user ? (
          <>
            <Calendar
              month={currentMonth}
              year={currentYear}
              records={records}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onDayClick={handleDayClick}
              onDeleteRecord={handleDeleteRecord}
            />

            <Dashboard
              records={records}
              onOpenAnalytics={() => setShowAnalytics(true)}
            />

            <button
              onClick={() => {
                setSelectedDate(formatDateForInput(new Date()));
                setShowAddModal(true);
              }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-all z-40"
              aria-label="Добавить заправку"
            >
              <Plus size={28} className="text-white" />
            </button>
          </>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-bold text-slate-200 mb-2">Войдите, чтобы начать</h2>
            <p className="text-slate-400 mb-4">Отслеживайте расходы на топливо</p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-xl"
            >
              Войти
            </button>
          </div>
        )}
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {showAddModal && user && (
        <AddRefuelModal
          user={user}
          stations={stations}
          defaultDate={selectedDate}
          onClose={() => setShowAddModal(false)}
          onOpenStationManager={() => setShowStationManager(true)}
        />
      )}
      {showAnalytics && user && (
        <AnalyticsModal
          records={records}
          onClose={() => setShowAnalytics(false)}
          onDeleteRecord={handleDeleteRecord}
        />
      )}
      {showStationManager && user && (
        <StationManagerModal
          user={user}
          stations={stations}
          onDeleteStation={handleDeleteStation}
          onClose={() => setShowStationManager(false)}
        />
      )}
    </div>
  );
}

export default App;