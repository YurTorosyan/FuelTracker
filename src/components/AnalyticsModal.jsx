import { useMemo, useState } from 'react';
import { X, Trash2, Award, TrendingDown, TrendingUp, Fuel } from 'lucide-react';
import { db, auth } from '../firebase';
import { deleteDoc, doc } from 'firebase/firestore';
import { computeStationStats } from '../utils/calculations';

const AnalyticsModal = ({ records, onClose, onDeleteRecord }) => {
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const propaneRecords = records.filter(r => r.type === 'propane');
  const petrolRecords = records.filter(r => r.type === 'petrol');

  const totalPropane = propaneRecords.reduce((sum, r) => sum + r.sum, 0);
  const totalPetrol = petrolRecords.reduce((sum, r) => sum + r.sum, 0);
  const totalExpenses = totalPropane + totalPetrol;
  const propanePercent = totalExpenses > 0 ? (totalPropane / totalExpenses * 100) : 0;
  const petrolPercent = totalExpenses > 0 ? (totalPetrol / totalExpenses * 100) : 0;
  const avgReceipt = records.length ? totalExpenses / records.length : 0;

  const daysBetween = useMemo(() => {
    if (records.length < 2) return 0;
    const sorted = [...records].sort((a, b) => a.date.seconds - b.date.seconds);
    let totalDays = 0;
    for (let i = 1; i < sorted.length; i++) {
      const diff = (sorted[i].date.toDate() - sorted[i-1].date.toDate()) / (1000 * 60 * 60 * 24);
      totalDays += diff;
    }
    return totalDays / (sorted.length - 1);
  }, [records]);

  // Используем новую функцию для статистики по АЗС
  const stationStats = useMemo(() => computeStationStats(records), [records]);

  const bestStation = stationStats
    .filter(s => s.avgConsumption != null)
    .sort((a, b) => a.avgConsumption - b.avgConsumption)[0];
  const worstStation = stationStats
    .filter(s => s.avgConsumption != null)
    .sort((a, b) => b.avgConsumption - a.avgConsumption)[0];

  const handleDelete = async (id) => {
    if (deleteConfirm === id) {
      try {
        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'logs', id));
        setDeleteConfirm(null);
        if (onDeleteRecord) onDeleteRecord(id);
      } catch (error) {
        console.error('Ошибка удаления:', error);
      }
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const formatDate = (timestamp) => {
    const date = timestamp.toDate();
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full hover:bg-slate-800">
          <X size={20} className="text-slate-300" />
        </button>

        <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
          <Fuel className="text-emerald-400" /> Аналитика расходов
        </h2>

        {/* Финансовое соотношение */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Соотношение трат</h3>
          <div className="bg-slate-800 rounded-xl p-4">
            <div className="flex justify-between mb-1">
              <span className="text-sm text-slate-400">Пропан</span>
              <span className="text-sm text-emerald-400">{totalPropane.toLocaleString('ru-RU')} ֏ ({propanePercent.toFixed(1)}%)</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 mb-3">
              <div className="bg-emerald-400 h-2 rounded-full" style={{ width: `${propanePercent}%` }}></div>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-slate-400">Бензин</span>
              <span className="text-sm text-blue-400">{totalPetrol.toLocaleString('ru-RU')} ֏ ({petrolPercent.toFixed(1)}%)</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-blue-400 h-2 rounded-full" style={{ width: `${petrolPercent}%` }}></div>
            </div>
          </div>
        </section>

        {/* Средние показатели */}
        <section className="mb-6 grid grid-cols-2 gap-3">
          <div className="bg-slate-800 rounded-xl p-3">
            <div className="text-sm text-slate-400">Средний чек</div>
            <div className="text-lg font-bold text-slate-100">{avgReceipt.toFixed(0)} ֏</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-3">
            <div className="text-sm text-slate-400">Ср. дней между заправками</div>
            <div className="text-lg font-bold text-slate-100">{daysBetween.toFixed(1)} дн.</div>
          </div>
        </section>

        {/* Лучшая и худшая АЗС */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Анализ АЗС (Газ)</h3>
          {bestStation && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 mb-3 flex items-center gap-3">
              <Award className="text-emerald-400" size={24} />
              <div>
                <div className="font-medium text-emerald-300">Лучшая АЗС: {bestStation.name}</div>
                <div className="text-sm text-emerald-200">
                  Расход {bestStation.avgConsumption.toFixed(2)} л/100км, {bestStation.avgCostPerKm.toFixed(2)} ֏/км
                </div>
              </div>
            </div>
          )}
          {worstStation && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-3">
              <TrendingDown className="text-red-400" size={24} />
              <div>
                <div className="font-medium text-red-300">Худшая АЗС: {worstStation.name}</div>
                <div className="text-sm text-red-200">
                  Расход {worstStation.avgConsumption.toFixed(2)} л/100км, {worstStation.avgCostPerKm.toFixed(2)} ֏/км
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Таблица по АЗС */}
        {stationStats.length > 0 && (
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-slate-200 mb-2">Все АЗС</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-700">
                    <th className="text-left py-2">АЗС</th>
                    <th className="text-right">Расход</th>
                    <th className="text-right">1 км</th>
                    <th className="text-right">Литры</th>
                    <th className="text-right">Сумма</th>
                    <th className="text-right">Визиты</th>
                  </tr>
                </thead>
                <tbody>
                  {stationStats.map(s => (
                    <tr key={s.name} className="border-b border-slate-800">
                      <td className="py-2 text-slate-300">{s.name}</td>
                      <td className="text-right text-slate-300">{s.avgConsumption ? s.avgConsumption.toFixed(2) : '—'}</td>
                      <td className="text-right text-slate-300">{s.avgCostPerKm ? s.avgCostPerKm.toFixed(2) : '—'}</td>
                      <td className="text-right text-slate-300">{s.totalLiters.toFixed(1)}</td>
                      <td className="text-right text-slate-300">{s.totalSum.toLocaleString('ru-RU')}</td>
                      <td className="text-right text-slate-300">{s.visits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Полный лог заправок */}
        <section>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Все заправки</h3>
          <div className="space-y-2">
            {records
              .slice()
              .sort((a, b) => b.date.seconds - a.date.seconds)
              .map(record => (
                <div key={record.id} className="bg-slate-800 rounded-xl p-3 flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${record.type === 'propane' ? 'bg-emerald-400' : 'bg-blue-400'}`}></div>
                  <div className="flex-1">
                    <div className="text-sm text-slate-200">
                      {formatDate(record.date)} — {record.type === 'propane' ? 'Пропан' : 'Бензин'}
                      {record.station && ` (${record.station})`}
                    </div>
                    <div className="text-xs text-slate-400">
                      {record.sum.toLocaleString('ru-RU')} ֏
                      {record.liters ? `, ${record.liters.toFixed(1)} л` : ''}
                      {record.mileage ? `, ${record.mileage} км` : ''}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(record.id)}
                    className={`p-1 rounded-full hover:bg-slate-700 ${deleteConfirm === record.id ? 'text-red-400' : 'text-slate-400'}`}
                    title={deleteConfirm === record.id ? 'Нажмите ещё раз для подтверждения' : 'Удалить'}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AnalyticsModal;