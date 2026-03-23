import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const userData = await login(email, password);
      const role = userData.role === 'dean' ? 'admin' : userData.role;
      navigate(`/${role}`, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка входа');
    }
  };

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center px-4">
      <div className="w-full max-w-[380px]">
        <div className="flex items-center gap-2 justify-center mb-8">
          <GraduationCap size={28} className="text-accent" />
          <div>
            <div className="text-lg font-semibold text-text-primary">ИМСИТ</div>
            <div className="text-xs text-text-secondary">Электронный дневник</div>
          </div>
        </div>

        <div className="bg-bg-surface border border-border rounded-btn p-6">
          <h1 className="text-[18px] font-semibold text-text-primary mb-6">Вход в систему</h1>

          {error && (
            <div className="mb-4 p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-btn text-sm text-[#991B1B]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm text-text-secondary mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-btn text-sm text-text-primary bg-bg-surface focus:outline-none focus:border-accent transition-colors"
                placeholder="email@imsit.ru"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm text-text-secondary mb-1.5">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-btn text-sm text-text-primary bg-bg-surface focus:outline-none focus:border-accent transition-colors"
                placeholder="Введите пароль"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-accent text-white text-sm font-medium rounded-btn hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>
        </div>

        <div className="mt-4 text-center text-[11px] text-text-secondary">
          Тестовые аккаунты: admin@imsit.ru / admin123
        </div>
      </div>
    </div>
  );
}
