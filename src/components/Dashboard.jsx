import { Fuel } from 'lucide-react';
import { computeOverallStats } from '../utils/calculations';

const Dashboard = ({ records, onOpenAnalytics }) => {
  const propaneRecords = records.filter(r => r.type === 'propane');
  const petrolRecords = records.filter(r => r.type === 'petrol');

  const propaneTotal = propaneRecords.reduce((s, r) => s + r.sum, 0);
  const petrolTotal = petrolRecords.reduce((s, r) => s + r.sum, 0);

  const { totalMileage, avgConsumption, avgCostPerKm } = computeOverallStats(records);

  const avgConsumptionDisplay = avgConsumption ? avgConsumption.toFixed(2) : '—';
  const avgCostPerKmDisplay = avgCostPerKm ? avgCostPerKm.toFixed(2) : '—';

  return (
    <div
      onClick={onOpenAnalytics}
      className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-5 shadow-lg cursor-pointer border border-white/10 hover:border-emerald-500/40 hover:shadow-emerald-500/10 transition-all active:scale-[0.98] slide-up"
    >
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-slate-100">Расходы за месяц</h2>
        <Fuel className="text-emerald-400" size={24} />
      </div>
      {records.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <p>Пока нет заправок в этом месяце</p>
          <p className="text-sm mt-1">Нажмите +, чтобы добавить</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700/50 rounded-xl p-3 border border-emerald-500/20">
              <div className="text-sm text-slate-400">Пропан</div>
              <div className="text-2xl font-bold text-emerald-400">{propaneTotal.toLocaleString('ru-RU')} ֏</div>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-3 border border-sky-500/20">
              <div className="text-sm text-slate-400">Бензин</div>
              <div className="text-2xl font-bold text-sky-400">{petrolTotal.toLocaleString('ru-RU')} ֏</div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Средний расход газа</span>
              <span className="font-medium text-slate-200">{avgConsumptionDisplay} л/100 км</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Стоимость 1 км на газе</span>
              <span className="font-medium text-slate-200">{avgCostPerKmDisplay} ֏/км</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Всего км на газе</span>
              <span className="font-medium text-slate-200">{totalMileage} км</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;