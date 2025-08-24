
import React, { useState } from 'react';
import { SCHOOL_LOGO_PATH } from '../constants';
import { apiService } from '../services/apiService';
import { EyeIcon, EyeOffIcon } from './icons/EyeIcons';
import { Page } from '../types';

interface ForgotPasswordPageProps {
  onNavigate: (page: Page) => void;
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
        setError('Password baru minimal harus 6 karakter.');
        return;
    }

    if (newPassword !== confirmPassword) {
      setError('Password baru dan konfirmasi password tidak cocok.');
      return;
    }

    setIsSubmitting(true);
    try {
      apiService.updatePassword(username, newPassword);
      setSuccess('Password berhasil diubah! Anda akan diarahkan ke halaman login.');
      setTimeout(() => onNavigate('login'), 3000);
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <img src={SCHOOL_LOGO_PATH} alt="School Logo" className="w-24 h-24 mx-auto mb-4"/>
          <h2 className="text-3xl font-bold text-slate-900">Reset Password</h2>
          <p className="text-slate-600">Masukkan username dan password baru Anda.</p>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">{error}</div>}
        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg" role="alert">{success}</div>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700">Username (Nama Lengkap)</label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nama Lengkap yang terdaftar"
            />
          </div>
          
          <div>
            <label htmlFor="newPassword"className="block text-sm font-medium text-slate-700">Password Baru</label>
            <div className="mt-1 relative">
                <input id="newPassword" type={showNewPassword ? 'text' : 'password'} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500">
                    {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword"className="block text-sm font-medium text-slate-700">Konfirmasi Password Baru</label>
            <div className="mt-1 relative">
                <input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500">
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !!success}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {isSubmitting ? 'Memproses...' : 'Reset Password'}
            </button>
          </div>
        </form>
        <p className="text-center text-sm text-slate-600">
          Kembali ke halaman{' '}
          <button onClick={() => onNavigate('login')} className="font-medium text-blue-600 hover:text-blue-500">
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
