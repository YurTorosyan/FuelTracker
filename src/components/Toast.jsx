const Toast = ({ toast }) => {
  if (!toast) return null;
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] slide-up">
      <div className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
        toast.type === 'error' ? 'bg-red-500/90 text-white' : 'bg-emerald-500/90 text-white'
      }`}>
        {toast.message}
      </div>
    </div>
  );
};

export default Toast;