import { Fuel } from 'lucide-react';

const Dashboard = ({ records, onOpenAnalytics }) => {
  const propaneRecords = records.filter(r => r.type === 'propane');
  const petrolRecords = records.filter(r => r.type === 'petrol');

  const propaneTotal = propaneRecords.reduce((s, r) => s + r.sum, 0);
  const petrolTotal = petrolRecords.reduce((s, r) => s + r.sum, 0);

  // Средний расход и стоимость 1 км (только по записям с вычисленным расходом)
  const consumptionValues = propaneRecords
    .filter(r => r.consumption != null)
    .map(r => r.consumption);
  const costPerKmValues = propaneRecords
    .filter(r => r.costPerKm != null)
    .map(r => r.costPerKm);
  const totalKmPropane = propaneRecords
    .filter(r => r.mileage)
    .reduce((s, r) => s + r.mileage, 0);

  const avgConsumption = consumptionValues.length
    ? (consumptionValues.reduce((a, b) => a + b, 0) / consumptionValues.length).toFixed(2)
    : '—';
  const avgCostPerKm = costPerKmValues.length
    ? (costPerKmValues.reduce((a, b) => a + b, 0) / costPerKmValues.length).toFixed(2)
    : '—';

  return (
    <div
      onClick={onOpenAnalytics}
      className="bg-slate-800 rounded-2xl p-5 shadow-lg cursor-pointer hover:bg-slate-750 transition-colors"
    >
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-slate-100">Расходы за месяц</h2>
        <Fuel className="text-emerald-400" size={24} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-700/50 rounded-xl p-3">
          <div className="text-sm text-slate-400">Пропан</div>
          <div className="text-2xl font-bold text-emerald-400">{propaneTotal.toLocaleString('ru-RU')} ֏</div>
        </div>
        <div className="bg-slate-700/50 rounded-xl p-3">
          <div className="text-sm text-slate-400">Бензин</div>
          <div className="text-2xl font-bold text-blue-400">{petrolTotal.toLocaleString('ru-RU')} ֏</div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-slate-400">Средний расход газа</span>
          <span className="font-medium text-slate-200">{avgConsumption} л/100 км</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Стоимость 1 км на газе</span>
          <span className="font-medium text-slate-200">{avgCostPerKm} ֏/км</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Всего км на газе</span>
          <span className="font-medium text-slate-200">{totalKmPropane} км</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;