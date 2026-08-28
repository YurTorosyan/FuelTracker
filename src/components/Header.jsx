import { Fuel, User } from 'lucide-react';

const Header = ({ user, onAuthClick }) => {
  return (
    <header className="flex items-center justify-between bg-slate-800 rounded-2xl p-3 shadow-lg">
      <div className="w-10"></div> {/* Пустой блок для симметрии */}
      <div className="flex items-center gap-2">
        <Fuel className="text-emerald-400" size={28} />
        <h1 className="text-xl font-bold text-slate-100">FuelTrack</h1>
      </div>
      <button
        onClick={onAuthClick}
        className="p-2 rounded-full hover:bg-slate-700 transition-colors"
        aria-label="Профиль"
      >
        {user ? (
          user.photoURL ? (
            <img src={user.photoURL} alt="Аватар" className="w-8 h-8 rounded-full" />
          ) : (
            <User size={24} className="text-slate-300" />
          )
        ) : (
          <User size={24} className="text-slate-300" />
        )}
      </button>
    </header>
  );
};

export default Header;