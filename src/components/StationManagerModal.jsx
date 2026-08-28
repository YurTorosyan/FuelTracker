import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

const StationManagerModal = ({ user, stations, onDeleteStation, onClose }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      await addDoc(collection(db, 'users', user.uid, 'stations'), { name: name.trim() });
      setName('');
      onClose(); // Закрываем после добавления (список обновится автоматически)
    } catch (err) {
      console.error('Ошибка добавления АЗС:', err);
      setError('Не удалось добавить. Проверьте права Firestore.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStation = async (stationId) => {
    if (onDeleteStation) {
      await onDeleteStation(stationId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl p-5 w-full max-w-xs shadow-2xl relative">
        <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full hover:bg-slate-700">
          <X size={18} className="text-slate-300" />
        </button>
        <h3 className="text-lg font-bold text-slate-100 mb-3">Управление АЗС</h3>

        {/* Список существующих станций */}
        {stations.length > 0 && (
          <div className="mb-4 max-h-40 overflow-y-auto">
            <div className="text-sm text-slate-400 mb-2">Ваши АЗС:</div>
            <ul className="space-y-1">
              {stations.map(station => (
                <li key={station.id} className="flex items-center justify-between bg-slate-700 rounded-lg px-3 py-2">
                  <span className="text-slate-200 text-sm">{station.name}</span>
                  <button
                    onClick={() => handleDeleteStation(station.id)}
                    className="text-red-400 hover:text-red-300 p-1"
                    aria-label={`Удалить ${station.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Форма добавления новой станции */}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Название новой АЗС"
            className="w-full bg-slate-700 text-slate-100 rounded-xl px-3 py-2 outline-none mb-3"
            autoFocus
            disabled={loading}
          />
          {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 rounded-xl ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Добавление...' : 'Добавить АЗС'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StationManagerModal;