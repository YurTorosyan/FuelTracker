import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

const StationManagerModal = ({ user, stations, onDeleteStation, onClose, showToast }) => {
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
      onClose();
      showToast('АЗС добавлена', 'success');
    } catch (err) {
      console.error('Ошибка добавления АЗС:', err);
      showToast('Не удалось добавить АЗС', 'error');
      setError('Ошибка добавления');
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
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-end sm:items-center justify-center p-4 z-50">
      <div className="bg-slate-800/95 backdrop-blur-md rounded-t-2xl sm:rounded-2xl p-5 w-full max-w-xs shadow-2xl relative slide-up">
        <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full hover:bg-slate-700 active:scale-90 transition-all">
          <X size={18} className="text-slate-300" />
        </button>
        <h3 className="text-lg font-bold text-slate-100 mb-3">Управление АЗС</h3>

        {stations.length > 0 ? (
          <div className="mb-4 max-h-40 overflow-y-auto">
            <div className="text-sm text-slate-400 mb-2">Ваши АЗС:</div>
            <ul className="space-y-1">
              {stations.map(station => (
                <li key={station.id} className="flex items-center justify-between bg-slate-700/50 rounded-lg px-3 py-2 border border-white/5">
                  <span className="text-slate-200 text-sm">{station.name}</span>
                  <button
                    onClick={() => handleDeleteStation(station.id)}
                    className="text-red-400 hover:text-red-300 p-1 active:scale-90 transition-all"
                    aria-label={`Удалить ${station.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-slate-400 mb-4 text-center">Список АЗС пуст</p>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Название новой АЗС"
            className="w-full bg-slate-700 text-slate-100 rounded-xl px-3 py-2 outline-none mb-3 focus:ring-2 focus:ring-emerald-500"
            autoFocus
            disabled={loading}
          />
          {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className={`w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 rounded-xl transition-all active:scale-95 ${
              loading || !name.trim() ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Добавление...' : 'Добавить АЗС'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StationManagerModal;