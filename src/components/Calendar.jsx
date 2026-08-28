import { useMemo } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

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

  const handleDeleteRecord = (e, recordId) => {
    e.stopPropagation();
    if (onDeleteRecord) onDeleteRecord(recordId);
  };

  return (
    <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/10 slide-up">
      <div className="flex justify-between items-center mb-4">
        <button onClick={onPrevMonth} className="p-1 rounded-full hover:bg-slate-700 active:scale-90 transition-all">
          <ChevronLeft size={20} className="text-slate-300" />
        </button>
        <div className="text-lg font-semibold text-slate-100">
          {new Date(year, month).toLocaleString('ru-RU', { month: 'long' })} {year}
        </div>
        <button onClick={onNextMonth} className="p-1 rounded-full hover:bg-slate-700 active:scale-90 transition-all">
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
            <div
              key={day}
              onClick={() => onDayClick(day)}
              className={`h-8 flex items-center justify-center rounded-lg relative cursor-pointer transition-all ${
                isToday ? 'border border-emerald-400 bg-emerald-400/10' : 'hover:bg-slate-700/50'
              } text-slate-300`}
            >
              <span>{day}</span>
              {dayRecords.length > 0 && (
                <div className="absolute bottom-0.5 flex gap-0.5">
                  {dayRecords.some(r => r.type === 'propane') && (
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  )}
                  {dayRecords.some(r => r.type === 'petrol') && (
                    <span className="w-1.5 h-1.5 bg-sky-400 rounded-full" />
                  )}
                </div>
              )}
              {dayRecords.length > 0 && (
                <div className="absolute top-0 right-0">
                  <button
                    onClick={(e) => handleDeleteRecord(e, dayRecords[0].id)}
                    className="text-red-400 hover:text-red-300 p-0.5 active:scale-90 transition-transform"
                    aria-label="Удалить заправку"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;