import { useState } from 'react';
import { X } from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';

const AuthModal = ({ onClose, showToast }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
        showToast('Регистрация успешна', 'success');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        showToast('Вход выполнен', 'success');
      }
      onClose();
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      showToast('Вход через Google выполнен', 'success');
      onClose();
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      showToast('Вы вышли из системы', 'success');
      onClose();
    } catch (err) {
      showToast('Ошибка выхода', 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-end sm:items-center justify-center p-4 z-50">
      <div className="bg-slate-800/95 backdrop-blur-md rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-sm shadow-2xl relative slide-up">
        <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full hover:bg-slate-700 active:scale-90 transition-all">
          <X size={20} className="text-slate-300" />
        </button>
        <h2 className="text-xl font-bold text-slate-100 mb-4">
          {isRegister ? 'Регистрация' : 'Вход'}
        </h2>

        <form onSubmit={handleEmailAuth} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full bg-slate-700 text-slate-100 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            className="w-full bg-slate-700 text-slate-100 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl transition-all active:scale-95 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Обработка...' : isRegister ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </form>

        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full mt-3 bg-white hover:bg-gray-200 text-gray-800 py-2 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </button>

        <button
          onClick={() => setIsRegister(!isRegister)}
          className="w-full mt-2 text-sm text-slate-400 hover:text-slate-300 transition-colors"
        >
          {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
        </button>

        {auth.currentUser && (
          <button onClick={handleSignOut} className="w-full mt-2 text-red-400 hover:text-red-300 text-sm transition-colors">
            Выйти
          </button>
        )}

        {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}
      </div>
    </div>
  );
};

export default AuthModal;