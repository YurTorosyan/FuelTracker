// Расчет литража
export const calcLiters = (sum, pricePerLiter) => {
  if (!sum || !pricePerLiter || pricePerLiter === 0) return 0;
  return sum / pricePerLiter;
};

// Вычисление расхода и стоимости 1 км для записи (если есть предыдущая заправка)
export const calcConsumptionForRecord = (record, previousPropaneRecord) => {
  if (!record.isTankEmpty || !record.mileage || !previousPropaneRecord) {
    return { consumption: null, costPerKm: null };
  }
  const liters = previousPropaneRecord.liters || 0;
  const sum = previousPropaneRecord.sum || 0;
  const mileage = record.mileage;
  const consumption = mileage > 0 ? (liters / mileage) * 100 : null;
  const costPerKm = mileage > 0 ? sum / mileage : null;
  return { consumption, costPerKm };
};

// Получение предыдущей пропановой записи для заданной записи
export const getPreviousPropaneRecord = (records, currentRecord) => {
  const sorted = records
    .filter(r => r.type === 'propane')
    .sort((a, b) => a.date.seconds - b.date.seconds);
  const idx = sorted.findIndex(r => r.id === currentRecord.id);
  if (idx <= 0) return null;
  return sorted[idx - 1];
};

// НОВАЯ ФУНКЦИЯ: вычисление статистики по станциям с корректной атрибуцией
export const computeStationStats = (records) => {
  const propaneRecords = records
    .filter(r => r.type === 'propane')
    .sort((a, b) => a.date.seconds - b.date.seconds); // от старых к новым

  const stats = {};

  propaneRecords.forEach((record, index) => {
    const stationName = record.station || 'Без АЗС';
    if (!stats[stationName]) {
      stats[stationName] = {
        visits: 0,
        totalLiters: 0,
        totalSum: 0,
        consumptions: [],
        costPerKm: [],
      };
    }
    const station = stats[stationName];
    station.visits += 1;
    station.totalLiters += record.liters || 0;
    station.totalSum += record.sum || 0;

    // Если текущая запись имеет пробег, расход относится к предыдущей станции
    if (index > 0 && record.isTankEmpty && record.mileage) {
      const prevRecord = propaneRecords[index - 1];
      const liters = prevRecord.liters || 0;
      const sum = prevRecord.sum || 0;
      const mileage = record.mileage;
      if (mileage > 0 && liters > 0) {
        const consumption = (liters / mileage) * 100;
        const costPerKm = sum / mileage;

        // Добавляем к предыдущей станции
        const prevStationName = prevRecord.station || 'Без АЗС';
        if (!stats[prevStationName]) {
          // на случай, если предыдущая станция не была инициализирована (маловероятно)
          stats[prevStationName] = {
            visits: 0,
            totalLiters: 0,
            totalSum: 0,
            consumptions: [],
            costPerKm: [],
          };
        }
        stats[prevStationName].consumptions.push(consumption);
        stats[prevStationName].costPerKm.push(costPerKm);
      }
    }
  });

  // Преобразуем в массив и вычисляем средние
  return Object.entries(stats).map(([name, data]) => ({
    name,
    visits: data.visits,
    totalLiters: data.totalLiters,
    totalSum: data.totalSum,
    avgConsumption: data.consumptions.length
      ? data.consumptions.reduce((a, b) => a + b, 0) / data.consumptions.length
      : null,
    avgCostPerKm: data.costPerKm.length
      ? data.costPerKm.reduce((a, b) => a + b, 0) / data.costPerKm.length
      : null,
  }));
};

// НОВАЯ ФУНКЦИЯ: общие метрики (средний расход, стоимость 1 км, пробег) с корректной атрибуцией
export const computeOverallStats = (records) => {
  const propaneRecords = records
    .filter(r => r.type === 'propane')
    .sort((a, b) => a.date.seconds - b.date.seconds);

  let totalMileage = 0;
  let totalConsumptions = [];
  let totalCostPerKm = [];

  propaneRecords.forEach((record, index) => {
    if (record.isTankEmpty && record.mileage) {
      totalMileage += record.mileage;
      if (index > 0) {
        const prevRecord = propaneRecords[index - 1];
        const liters = prevRecord.liters || 0;
        const sum = prevRecord.sum || 0;
        if (record.mileage > 0 && liters > 0) {
          totalConsumptions.push((liters / record.mileage) * 100);
          totalCostPerKm.push(sum / record.mileage);
        }
      }
    }
  });

  const avgConsumption = totalConsumptions.length
    ? totalConsumptions.reduce((a, b) => a + b, 0) / totalConsumptions.length
    : null;
  const avgCostPerKm = totalCostPerKm.length
    ? totalCostPerKm.reduce((a, b) => a + b, 0) / totalCostPerKm.length
    : null;

  return {
    totalMileage,
    avgConsumption,
    avgCostPerKm,
  };
};