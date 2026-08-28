export const CalendarSkeleton = () => (
  <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/10">
    <div className="flex justify-between items-center mb-4">
      <div className="skeleton h-6 w-6" />
      <div className="skeleton h-6 w-32" />
      <div className="skeleton h-6 w-6" />
    </div>
    <div className="grid grid-cols-7 gap-1">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={`head-${i}`} className="skeleton h-4 w-full" />
      ))}
      {Array.from({ length: 35 }).map((_, i) => (
        <div key={`day-${i}`} className="skeleton h-8 w-full" />
      ))}
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-5 shadow-lg border border-white/10">
    <div className="flex justify-between items-start mb-4">
      <div className="skeleton h-6 w-40" />
      <div className="skeleton h-6 w-6" />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="skeleton h-16" />
      <div className="skeleton h-16" />
    </div>
    <div className="mt-4 space-y-3">
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-full" />
    </div>
  </div>
);

export const AnalyticsSkeleton = () => (
  <div className="space-y-6">
    <div className="skeleton h-8 w-48" />
    <div className="skeleton h-24 w-full" />
    <div className="skeleton h-20 w-full" />
    <div className="skeleton h-40 w-full" />
    <div className="skeleton h-64 w-full" />
  </div>
);