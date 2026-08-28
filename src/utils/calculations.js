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