import { useState, useEffect } from 'react';
import { X, Plus, Fuel } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { calcLiters } from '../utils/calculations';

const AddRefuelModal = ({ user, stations, defaultDate, onClose, onOpenStationManager }) => {
  const [fuelType, setFuelType] = useState('propane');
  const [station, setStation] = useState('');
  const [isTankEmpty, setIsTankEmpty] = useState(false);
  const [mileage, setMileage] = useState('');
  const [sum, setSum] = useState('');
  const [pricePerLiter, setPricePerLiter] = useState('');
  const [date, setDate] = useState(defaultDate || new Date());
  const [notification, setNotification] = useState('');

  useEffect(() => {
    if (stations.length > 0 && !station) {
      setStation(stations[0].name);
    }
  }, [stations]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sum) return;

    const sumNum = parseFloat(sum);
    if (isNaN(sumNum)) return;

    try {
      const record = {
        type: fuelType,
        sum: sumNum,
        date: date instanceof Date ? serverTimestamp() : date, // если передали Timestamp, не перезаписываем
      };

      if (fuelType === 'propane') {
        if (!station) {
          alert('Выберите АЗС');
          return;
        }
        if (!pricePerLiter) {
          alert('Введите цену за литр');
          return;
        }
        const priceNum = parseFloat(pricePerLiter);
        if (isNaN(priceNum) || priceNum <= 0) return;

        const liters = calcLiters(sumNum, priceNum);
        record.station = station;
        record.pricePerLiter = priceNum;
        record.liters = liters;
        record.isTankEmpty = isTankEmpty;
        if (isTankEmpty) {
          if (!mileage || parseFloat(mileage) <= 0) {
            alert('Введите пробег');
            return;
          }
          record.mileage = parseFloat(mileage);
        }
      }

      await addDoc(collection(db, 'users', user.uid, 'logs'), record);
      setNotification('Не забудь сбросить трип-метр на 0!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Ошибка добавления записи:', error);
    }
  };

  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = date instanceof Date ? date : date.toDate();
    return d.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
        <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full hover:bg-slate-700">
          <X size={20} className="text-slate-300" />
        </button>

        <h2 className="text-xl font-bold text-slate-100 mb-4">Новая заправка</h2>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFuelType('propane')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium ${fuelType === 'propane' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'}`}
          >
            Пропан
          </button>
          <button
            onClick={() => setFuelType('petrol')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium ${fuelType === 'petrol' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'}`}
          >
            Бензин
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Выбор даты */}
          <div className="mb-3">
            <label className="block text-sm text-slate-400 mb-1">Дата</label>
            <input
              type="date"
              value={formatDateForInput(date)}
              onChange={(e) => setDate(e.target.value ? new Date(e.target.value) : new Date())}
              className="w-full bg-slate-700 text-slate-100 rounded-xl px-3 py-2 outline-none"
            />
          </div>

          {fuelType === 'propane' ? (
            <>
              <div className="mb-3">
                <label className="block text-sm text-slate-400 mb-1">АЗС</label>
                <div className="flex gap-2">
                  <select
                    value={station}
                    onChange={(e) => setStation(e.target.value)}
                    className="flex-1 bg-slate-700 text-slate-100 rounded-xl px-3 py-2 outline-none"
                  >
                    {stations.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={onOpenStationManager}
                    className="bg-slate-700 text-slate-300 p-2 rounded-xl hover:bg-slate-600"
                    aria-label="Добавить АЗС"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-400">Бак выкатан в ноль?</span>
                <button
                  type="button"
                  onClick={() => setIsTankEmpty(!isTankEmpty)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${isTankEmpty ? 'bg-emerald-500' : 'bg-slate-600'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isTankEmpty ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <div className="mb-3">
                <label className="block text-sm text-slate-400 mb-1">
                  Пробег с прошлым сброса (км)
                </label>
                <input
                  type="number"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  disabled={!isTankEmpty}
                  placeholder={isTankEmpty ? "Например, 320" : "Только при пустом баке"}
                  className={`w-full bg-slate-700 text-slate-100 rounded-xl px-3 py-2 outline-none ${!isTankEmpty ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-400 mb-4">Для бензина учитывается только сумма.</p>
          )}

          <div className="mb-3">
            <label className="block text-sm text-slate-400 mb-1">Сумма заправки (֏)</label>
            <input
              type="number"
              value={sum}
              onChange={(e) => setSum(e.target.value)}
              required
              placeholder="10000"
              className="w-full bg-slate-700 text-slate-100 rounded-xl px-3 py-2 outline-none"
            />
          </div>

          {fuelType === 'propane' && (
            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-1">Цена за 1 литр (֏)</label>
              <input
                type="number"
                value={pricePerLiter}
                onChange={(e) => setPricePerLiter(e.target.value)}
                required
                placeholder="290"
                className="w-full bg-slate-700 text-slate-100 rounded-xl px-3 py-2 outline-none"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 rounded-xl transition-colors"
          >
            Сохранить
          </button>
        </form>

        {notification && (
          <div className="mt-4 bg-emerald-500/20 text-emerald-300 text-sm p-3 rounded-xl flex items-center gap-2 animate-pulse">
            <Fuel size={16} />
            {notification}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddRefuelModal;