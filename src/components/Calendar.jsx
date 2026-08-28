import { useMemo, memo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

// Мемоизированный компонент дня
const DayCell = memo(({ day, isToday, dayRecords, onDayClick, onDeleteRecord }) => {
  const handleClick = useCallback(() => onDayClick(day), [onDayClick, day]);
  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    if (dayRecords.length > 0) onDeleteRecord(dayRecords[0].id);
  }, [onDeleteRecord, dayRecords]);

  return (
    <div
      onClick={handleClick}
      className={`h-8 flex items-center justify-center rounded-lg relative cursor-pointer transition-colors duration-150 ${
        isToday ? 'border border-emerald-400 bg-emerald-400/10' : 'hover:bg-slate-700/50'
      } text-slate-300`}
    >
      <span>{day}</span>
      {dayRecords.length > 0 && (
        <div className="absolute bottom-0.5 flex gap-0.5">
          {dayRecords.some(r => r.type === 'propane') && <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />}
          {dayRecords.some(r => r.type === 'petrol') && <span className="w-1.5 h-1.5 bg-sky-400 rounded-full" />}
        </div>
      )}
      {dayRecords.length > 0 && (
        <div className="absolute top-0 right-0">
          <button
            onClick={handleDelete}
            className="text-red-400 hover:text-red-300 p-0.5 active:scale-90 transition-transform"
            aria-label="Удалить заправку"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
});

const Calendar = ({ month, year, records, onPrevMonth, onNextMonth, onDayClick, onDeleteRecord }) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7;
  const today = new Date();
  const isCurrentMonth = month === today.getMonth() && year === today.getFullYear();

  const recordsByDay = useMemo(() => {
    const map = {};
    records.forEach(record => {
      const date = record.date.toDate();
      const day = date.getDate();
      if (!map[day]) map[day] = [];
      map[day].push(record);
    });
    return map;
  }, [records]);

  const handlePrev = useCallback(() => onPrevMonth(), [onPrevMonth]);
  const handleNext = useCallback(() => onNextMonth(), [onNextMonth]);

  return (
    <div className="bg-slate-800 rounded-2xl p-4 shadow-md border border-white/10 slide-up">
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrev} className="p-1 rounded-full hover:bg-slate-700 active:scale-90 transition-colors duration-150">
          <ChevronLeft size={20} className="text-slate-300" />
        </button>
        <div className="text-lg font-semibold text-slate-100">
          {new Date(year, month).toLocaleString('ru-RU', { month: 'long' })} {year}
        </div>
        <button onClick={handleNext} className="p-1 rounded-full hover:bg-slate-700 active:scale-90 transition-colors duration-150">
          <ChevronRight size={20} className="text-slate-300" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
          <div key={day} className="text-slate-400 font-medium">{day}</div>
        ))}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="h-8" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayRecords = recordsByDay[day] || [];
          const isToday = isCurrentMonth && day === today.getDate();
          return (
            <DayCell
              key={day}
              day={day}
              isToday={isToday}
              dayRecords={dayRecords}
              onDayClick={onDayClick}
              onDeleteRecord={onDeleteRecord}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;