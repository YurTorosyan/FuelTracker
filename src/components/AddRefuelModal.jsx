import { useState, useEffect } from 'react';
import { X, Plus, Fuel } from 'lucide-react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { calcLiters } from '../utils/calculations';
import { parseInputDate } from '../utils/dateUtils';

const AddRefuelModal = ({ user, stations, defaultDate, onClose, onOpenStationManager, showToast }) => {
  const [fuelType, setFuelType] = useState('propane');
  const [station, setStation] = useState('');
  const [isTankEmpty, setIsTankEmpty] = useState(false);
  const [mileage, setMileage] = useState('');
  const [sum, setSum] = useState('');
  const [pricePerLiter, setPricePerLiter] = useState('');
  const [date, setDate] = useState(defaultDate || '');
  const [notification, setNotification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Блокировка скролла заднего фона
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    if (stations.length > 0 && !station) {
      setStation(stations[0].name);
    }
  }, [stations]);

  const isFormValid = () => {
    if (!date || !sum || parseFloat(sum) <= 0) return false;
    if (fuelType === 'propane') {
      if (!station) return false;
      if (!pricePerLiter || parseFloat(pricePerLiter) <= 0) return false;
      if (isTankEmpty && (!mileage || parseFloat(mileage) <= 0)) return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      showToast('Заполните все обязательные поля корректно', 'error');
      return;
    }

    setIsSubmitting(true);
    const sumNum = parseFloat(sum);
    const dateObj = parseInputDate(date);

    try {
      const record = {
        type: fuelType,
        sum: sumNum,
        date: Timestamp.fromDate(dateObj),
      };

      if (fuelType === 'propane') {
        const priceNum = parseFloat(pricePerLiter);
        const liters = calcLiters(sumNum, priceNum);
        record.station = station;
        record.pricePerLiter = priceNum;
        record.liters = liters;
        record.isTankEmpty = isTankEmpty;
        if (isTankEmpty) {
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
      showToast('Не удалось сохранить заправку', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-2xl bg-slate-800 border-t sm:border border-slate-700/80 p-5 shadow-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden overscroll-contain animate-in slide-in-from-bottom duration-200 relative">
        {/* Полоска-индикатор (handle bar) */}
        <div className="w-12 h-1.5 bg-slate-600 rounded-full mx-auto mb-4 opacity-60" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-700 active:scale-90 transition-all"
        >
          <X size={20} className="text-slate-300" />
        </button>

        <h2 className="text-xl font-bold text-slate-100 mb-4">Новая заправка</h2>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFuelType('propane')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 ${
              fuelType === 'propane' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
            }`}
          >
            Пропан
          </button>
          <button
            onClick={() => setFuelType('petrol')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 ${
              fuelType === 'petrol' ? 'bg-sky-500 text-white' : 'bg-slate-700 text-slate-300'
            }`}
          >
            Бензин
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block text-sm text-slate-400 mb-1">Дата</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-700 text-slate-100 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
              required
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
                    className="flex-1 bg-slate-700 text-slate-100 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {stations.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={onOpenStationManager}
                    className="bg-slate-700 text-slate-300 p-2 rounded-xl hover:bg-slate-600 active:scale-95 transition-all"
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
                <label className="block text-sm text-slate-400 mb-1">Пробег с прошлым сброса (км)</label>
                <input
                  type="number"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  disabled={!isTankEmpty}
                  placeholder={isTankEmpty ? "Например, 320" : "Только при пустом баке"}
                  className={`w-full bg-slate-700 text-slate-100 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 ${
                    !isTankEmpty ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  inputMode="decimal"
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
              className="w-full bg-slate-700 text-slate-100 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              inputMode="decimal"
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
                className="w-full bg-slate-700 text-slate-100 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                inputMode="decimal"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={!isFormValid() || isSubmitting}
            className={`w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 rounded-xl transition-all active:scale-95 ${
              !isFormValid() || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
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