
import React from 'react';
import { SCHOOL_LOGO_PATH } from '../constants';

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900">
      <div className="text-center p-8">
        <img src={SCHOOL_LOGO_PATH} alt="Logo SMKN 1 Indra Makmu" className="w-40 h-40 mx-auto mb-4 animate-pulse" />
        <h1 className="text-3xl font-bold text-white">Sistem Absensi Guru</h1>
        <p className="text-lg text-slate-300">SMKN 1 Indra Makmu</p>
        <div className="mt-8">
            <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-blue-500 mx-auto"></div>
            <p className="mt-4 text-slate-400">Memuat Aplikasi...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
