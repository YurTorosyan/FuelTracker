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
import { getPreviousPropaneRecord, calcConsumptionForRecord } from './utils/calculations';

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
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Отслеживание состояния аутентификации
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Загрузка записей и станций при наличии пользователя
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

  // Обогащение записей данными о расходе
  const enrichedRecords = records.map(record => {
    if (record.type === 'propane' && record.isTankEmpty) {
      const prevPropane = getPreviousPropaneRecord(records, record);
      const { consumption, costPerKm } = calcConsumptionForRecord(record, prevPropane);
      return { ...record, consumption, costPerKm };
    }
    return { ...record, consumption: null, costPerKm: null };
  });

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
    setSelectedDate(new Date(currentYear, currentMonth, day));
    setShowAddModal(true);
  };

  // Функция удаления записи (используется в Calendar и AnalyticsModal)
  const handleDeleteRecord = async (recordId) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'logs', recordId));
      // Обновление произойдёт автоматически через onSnapshot
    } catch (error) {
      console.error('Ошибка удаления записи:', error);
    }
  };

  // Функция удаления станции (АЗС)
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
              records={enrichedRecords}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onDayClick={handleDayClick}
              onDeleteRecord={handleDeleteRecord}
            />

            <Dashboard
              records={enrichedRecords}
              onOpenAnalytics={() => setShowAnalytics(true)}
            />

            {/* Плавающая кнопка добавления */}
            <button
              onClick={() => {
                setSelectedDate(new Date());
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

      {/* Модальные окна */}
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
          records={enrichedRecords}
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