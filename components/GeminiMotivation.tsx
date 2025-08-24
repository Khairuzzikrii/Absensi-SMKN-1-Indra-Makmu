
import React, { useState, useEffect, useCallback } from 'react';
import { geminiService } from '../services/geminiService';

interface GeminiMotivationProps {
  userName: string;
}

const GeminiMotivation: React.FC<GeminiMotivationProps> = ({ userName }) => {
  const [motivation, setMotivation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMotivation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const newMotivation = await geminiService.generateMotivation(userName);
      setMotivation(newMotivation);
    } catch (err) {
      setError('Gagal memuat motivasi. Silakan coba lagi.');
      setMotivation('Tetap semangat dalam mengajar, Anda adalah pahlawan tanpa tanda jasa.'); // Fallback
    } finally {
      setIsLoading(false);
    }
  }, [userName]);

  useEffect(() => {
    fetchMotivation();
  }, [fetchMotivation]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-3 py-1">
            <div className="h-2 bg-slate-300 rounded"></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-2 bg-slate-300 rounded col-span-2"></div>
              <div className="h-2 bg-slate-300 rounded col-span-1"></div>
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return <p className="text-red-600">{error}</p>;
    }

    return <p className="text-slate-600 italic">"{motivation}"</p>;
  };

  return (
    <div className="bg-white border-l-4 border-blue-500 text-slate-700 p-4 rounded-r-lg shadow-md mb-6">
      <div className="flex items-center">
        <div className="py-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div className="flex-grow">
          <p className="font-bold text-slate-800">Motivasi Hari Ini</p>
          {renderContent()}
        </div>
        <button onClick={fetchMotivation} disabled={isLoading} className="ml-4 p-2 rounded-full hover:bg-slate-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Dapatkan kutipan baru">
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-blue-700 ${isLoading ? 'animate-spin' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
        </button>
      </div>
    </div>
  );
};

export default GeminiMotivation;
