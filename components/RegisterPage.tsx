
import React, { useState } from 'react';
import { apiService } from '../services/apiService';
import { JenisGTK, StatusGTK, UserRole, Page } from '../types';
import { SCHOOL_LOGO_PATH, JENIS_GTK_OPTIONS, STATUS_GTK_OPTIONS } from '../constants';
import { EyeIcon, EyeOffIcon } from './icons/EyeIcons';

interface RegisterPageProps {
  onNavigate: (page: Page, options?: { username?: string }) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [jenisGtk, setJenisGtk] = useState<JenisGTK>(JENIS_GTK_OPTIONS[0]);
  const [statusGtk, setStatusGtk] = useState<StatusGTK>(STATUS_GTK_OPTIONS[0]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if(!name.trim()) {
        setError('Nama Lengkap wajib diisi.');
        return;
    }
    if (password.length < 6) {
      setError('Password minimal harus 6 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok.');
      return;
    }
    setIsSubmitting(true);
    try {
      apiService.register({
        name,
        password,
        role: UserRole.TEACHER,
        jenisGtk,
        statusGtk,
      });
      setSuccess('Registrasi berhasil! Anda akan diarahkan ke halaman login...');
      setTimeout(() => onNavigate('login', { username: name }), 3000);
    } catch (err: any)
    {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
            <img src={SCHOOL_LOGO_PATH} alt="School Logo" className="w-24 h-24 mx-auto mb-4"/>
            <h2 className="text-3xl font-bold text-slate-900">Buat Akun Baru</h2>
            <p className="text-slate-600">Daftar sebagai Guru / Pegawai</p>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">{error}</div>}
        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg" role="alert">{success}</div>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nama Lengkap (sebagai Username)</label>
            <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="Termasuk gelar, jika ada"/>
          </div>
          
          <div>
            <label htmlFor="password"className="block text-sm font-medium text-slate-700">Password</label>
             <div className="mt-1 relative">
                <input id="password" type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500">
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword"className="block text-sm font-medium text-slate-700">Konfirmasi Password</label>
            <div className="mt-1 relative">
                <input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500">
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
            </div>
          </div>

          <div>
            <label htmlFor="jenisGtk" className="block text-sm font-medium text-slate-700">Jenis GTK</label>
            <select id="jenisGtk" value={jenisGtk} onChange={(e) => setJenisGtk(e.target.value as JenisGTK)} className="mt-1 block w-full px-3 py-2 border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                {JENIS_GTK_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
           <div>
            <label htmlFor="statusGtk" className="block text-sm font-medium text-slate-700">Status GTK</label>
            <select id="statusGtk" value={statusGtk} onChange={(e) => setStatusGtk(e.target.value as StatusGTK)} className="mt-1 block w-full px-3 py-2 border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                {STATUS_GTK_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
          <div className="pt-2">
            <button type="submit" disabled={isSubmitting || !!success} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300">
              {isSubmitting ? 'Mendaftarkan...' : 'Daftar'}
            </button>
          </div>
        </form>
         <p className="text-center text-sm text-slate-600">
          Sudah punya akun?{' '}
          <button onClick={() => onNavigate('login')} className="font-medium text-blue-600 hover:text-blue-500">
            Masuk di sini
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
