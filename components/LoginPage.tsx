
import React, { useState, useEffect } from 'react';
import { User, UserRole, Page } from '../types';
import { apiService } from '../services/apiService';
import { SCHOOL_LOGO_PATH } from '../constants';
import { EyeIcon, EyeOffIcon } from './icons/EyeIcons';

interface LoginPageProps {
  onLogin: (user: User) => void;
  onNavigate: (page: Page, options?: { username?: string }) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigate }) => {
  const [loginRole, setLoginRole] = useState<'admin' | 'teacher' | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
      const registeredUsername = sessionStorage.getItem('registered_username');
      if (registeredUsername) {
          setUsername(registeredUsername);
          setLoginRole('teacher'); // Assume they are a teacher after registering
          sessionStorage.removeItem('registered_username');
      }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const loginUsername = loginRole === 'admin' ? 'admin' : username;
      const user = apiService.login(loginUsername, password);
       if (
        (loginRole === 'admin' && user.role !== UserRole.ADMIN) ||
        (loginRole === 'teacher' && user.role !== UserRole.TEACHER)
      ) {
         setError('Akun tidak ditemukan untuk peran ini. Silakan coba halaman login yang sesuai.');
         return;
      }
      onLogin(user);
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  const handleRoleSelect = (role: 'admin' | 'teacher') => {
    setLoginRole(role);
    setError('');
    setUsername(role === 'admin' ? 'admin' : '');
    setPassword('');
  };
  
  const handleBack = () => {
    setLoginRole(null);
    setError('');
    setUsername('');
    setPassword('');
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6 transform transition-all">
        <div className="text-center">
            <img src={SCHOOL_LOGO_PATH} alt="School Logo" className="w-24 h-24 mx-auto mb-4"/>
            <h2 className="text-3xl font-bold text-slate-900">Selamat Datang</h2>
        </div>

        {!loginRole ? (
            <>
                <p className="text-center text-slate-600">Silakan pilih peran Anda untuk masuk.</p>
                <div className="space-y-4 pt-4">
                    <button
                    onClick={() => handleRoleSelect('teacher')}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
                    >
                    Login sebagai Guru / Pegawai
                    </button>
                    <button
                    onClick={() => handleRoleSelect('admin')}
                    className="w-full flex justify-center py-3 px-4 border border-slate-300 rounded-lg shadow-sm text-base font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-transform transform hover:scale-105"
                    >
                    Login sebagai Admin
                    </button>
                </div>
            </>
        ) : (
            <>
                <div className="text-center">
                    <button onClick={handleBack} className="text-sm text-blue-600 hover:text-blue-800 mb-2 font-medium">
                        &larr; Kembali pilih peran
                    </button>
                    <p className="text-slate-600">
                        {loginRole === 'teacher' ? 'Masuk ke akun Guru Anda' : 'Masuk ke akun Admin Anda'}
                    </p>
                </div>

                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">{error}</div>}

                <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-slate-700">Username</label>
                    <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    disabled={loginRole === 'admin'}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-slate-100"
                    placeholder={loginRole === 'teacher' ? "Nama Lengkap Anda" : "admin"}
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
                    <div className="mt-1 relative">
                        <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="********"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500"
                            aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                        >
                            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                    </div>
                </div>

                {loginRole === 'teacher' && (
                    <div className="text-right text-sm">
                        <button type="button" onClick={() => onNavigate('forgot-password')} className="font-medium text-blue-600 hover:text-blue-500">
                            Lupa password?
                        </button>
                    </div>
                )}

                <div>
                    <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                    Masuk
                    </button>
                </div>
                </form>
                
                {loginRole === 'teacher' && (
                    <p className="text-center text-sm text-slate-600">
                    Belum punya akun?{' '}
                    <button onClick={() => onNavigate('register')} className="font-medium text-blue-600 hover:text-blue-500">
                        Daftar di sini
                    </button>
                    </p>
                )}
            </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
