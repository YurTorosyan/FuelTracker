import { Fuel, User } from 'lucide-react';

const Header = ({ user, onAuthClick }) => {
  return (
    <header className="flex items-center justify-between bg-slate-800/80 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-white/10">
      <div className="w-10"></div>
      <div className="flex items-center gap-2">
        <Fuel className="text-emerald-400" size={28} />
        <h1 className="text-xl font-bold text-slate-100">FuelTrack</h1>
      </div>
      <button
        onClick={onAuthClick}
        className="p-2 rounded-full hover:bg-slate-700 active:scale-95 transition-all"
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