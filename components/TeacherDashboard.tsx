
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, AttendanceRecord, Keterangan, AttendanceStatus, Coordinates, AttendanceType, AttendanceRemark } from '../types';
import { SCHOOL_COORDINATES, SCHOOL_RADIUS_KM, KETERANGAN_OPTIONS, SCHOOL_LOGO_PATH } from '../constants';
import { apiService } from '../services/apiService';
import { locationService } from '../services/locationService';
import { geminiService } from '../services/geminiService';
import GeminiMotivation from './GeminiMotivation';

// --- GPS Instruction Modal ---
const GpsInstructionModal = ({ isOpen, onClose, onLocationSuccess, onLocationError }: {
    isOpen: boolean;
    onClose: () => void;
    onLocationSuccess: (data: any) => void;
    onLocationError: (error: string) => void;
}) => {
    const [status, setStatus] = useState<'instructions' | 'loading' | 'success' | 'error'>('instructions');
    const [distance, setDistance] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    const handleGetLocation = async () => {
        setStatus('loading');
        try {
            const position = await locationService.getCurrentPosition();
            const employeeCoords: Coordinates = { latitude: position.coords.latitude, longitude: position.coords.longitude };
            const dist = locationService.calculateDistance(employeeCoords, SCHOOL_COORDINATES);
            const isWithinRadius = dist <= SCHOOL_RADIUS_KM;

            const locationData = {
                employeeGps: employeeCoords, isGpsActive: true, distance: dist, isWithinRadius,
            };
            setDistance(dist);
            setStatus('success');
            setTimeout(() => {
                onLocationSuccess(locationData);
                onClose();
            }, 3000);
        } catch (err: any) {
            const errorMsg = `Gagal mendapatkan lokasi: ${err.message}. Pastikan GPS aktif dan Anda telah memberikan izin lokasi.`;
            setErrorMessage(errorMsg);
            setStatus('error');
            onLocationError(errorMsg);
        }
    };

    useEffect(() => {
        if (isOpen) {
            setStatus('instructions');
            setErrorMessage('');
            setDistance(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm text-center">
                {status === 'instructions' && (
                    <>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Izin Lokasi Diperlukan</h3>
                        <p className="text-slate-600 mb-4">Aplikasi akan meminta izin untuk mengakses lokasi Anda untuk validasi absensi. Mohon klik "Izinkan" atau "Allow" pada prompt browser.</p>
                        <button onClick={handleGetLocation} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                            Mengerti & Lanjutkan
                        </button>
                    </>
                )}
                {status === 'loading' && (
                    <>
                        <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-slate-600">Menunggu izin dan mengambil data GPS...</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-xl font-bold text-green-600 mt-4">GPS Berhasil Diaktifkan!</h3>
                        <p className="text-slate-600">Jarak Anda dari sekolah: <strong>{distance?.toFixed(2)} km</strong></p>
                        <p className="text-sm text-slate-500 mt-2">Anda sekarang dapat melanjutkan absensi.</p>
                    </>
                )}
                 {status === 'error' && (
                    <>
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-xl font-bold text-red-600 mt-4">Gagal Mengambil Lokasi</h3>
                        <p className="text-slate-600 text-sm mt-2">{errorMessage}</p>
                        <button onClick={onClose} className="mt-4 w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg">
                            Tutup
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

// --- Teacher Dashboard ---
const TeacherDashboard: React.FC<{ currentUser: User; onLogout: () => void; }> = ({ currentUser, onLogout }) => {
  const [myAttendance, setMyAttendance] = useState<AttendanceRecord[]>([]);
  const [attendanceState, setAttendanceState] = useState<'idle' | 'form' | 'submitting' | 'submitted'>('idle');
  const [currentAttendanceType, setCurrentAttendanceType] = useState<AttendanceType | null>(null);
  const [isGpsModalOpen, setIsGpsModalOpen] = useState(false);
  const [locationData, setLocationData] = useState<any>(null);
  
  const [keterangan, setKeterangan] = useState<Keterangan>(Keterangan.HADIR);
  const [keteranganIzin, setKeteranganIzin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [filterType, setFilterType] = useState<'month' | 'date'>('month');
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const fetchAttendance = useCallback(() => {
    setMyAttendance(apiService.getAttendanceForUser(currentUser.id));
  }, [currentUser.id]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);
  
  const { todayCheckIn, todayCheckOut } = useMemo(() => {
      const todayStr = new Date().toLocaleDateString('id-ID');
      const todayRecords = myAttendance.filter(rec => new Date(rec.timestamp).toLocaleDateString('id-ID') === todayStr);
      return {
          todayCheckIn: todayRecords.find(r => r.type === AttendanceType.CHECK_IN),
          todayCheckOut: todayRecords.find(r => r.type === AttendanceType.CHECK_OUT),
      };
  }, [myAttendance]);

  const filteredAttendance = useMemo(() => {
    let records = myAttendance;
    if (filterType === 'month' && filterMonth) {
        records = records.filter(rec => new Date(rec.timestamp).toISOString().slice(0, 7) === filterMonth);
    } else if (filterType === 'date' && filterStartDate && filterEndDate) {
        const start = new Date(filterStartDate).getTime();
        const end = new Date(filterEndDate).setHours(23, 59, 59, 999);
        records = records.filter(rec => rec.timestamp >= start && rec.timestamp <= end);
    }
    return records.sort((a, b) => b.timestamp - a.timestamp);
  }, [myAttendance, filterType, filterMonth, filterStartDate, filterEndDate]);
  
  const attendanceSummary = useMemo(() => {
    const recordsInFilter = filteredAttendance.filter(r => r.type === AttendanceType.CHECK_IN);
    const summary = recordsInFilter.reduce((acc, rec) => {
        if (rec.keterangan === Keterangan.HADIR) acc.hadir++;
        if (rec.keterangan === Keterangan.IZIN) acc.izin++;
        if (rec.keterangan === Keterangan.SAKIT) acc.sakit++;
        if (rec.remark === AttendanceRemark.LATE) acc.terlambat++;
        return acc;
    }, { hadir: 0, izin: 0, sakit: 0, terlambat: 0 });
    return summary;
  }, [filteredAttendance]);

  const handleStartAttendance = (type: AttendanceType) => {
    setError('');
    setSuccess('');
    setCurrentAttendanceType(type);
    setIsGpsModalOpen(true);
  };
  
  const handleLocationSuccess = async (data: any) => {
    setAttendanceState('submitting'); // Show loading while fetching address
    const address = await geminiService.getAddressFromCoordinates(data.employeeGps);
    setLocationData({ ...data, address });
    setAttendanceState('form');
    if (!data.isWithinRadius) {
        setError("Perhatian: Anda berada di luar radius sekolah. Absensi akan ditandai sebagai 'Di Luar Area'.");
    }
  };
  
  const handleLocationError = (errorMessage: string) => {
    setError(errorMessage);
    setLocationData(null);
    setAttendanceState('idle');
  };

  const handleSubmitAttendance = () => {
    if (!locationData || !currentAttendanceType) {
        setError("Data lokasi tidak valid atau tipe absensi tidak diketahui. Mohon ulangi proses.");
        return;
    }
    if (currentAttendanceType === AttendanceType.CHECK_IN && (keterangan === Keterangan.IZIN || keterangan === Keterangan.SAKIT) && !keteranganIzin.trim()) {
        setError('Alasan izin/sakit harus diisi.');
        return;
    }

    setAttendanceState('submitting');
    let remark: AttendanceRemark | null = null;
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours + minutes / 60; // e.g., 8:30 -> 8.5

    if (currentAttendanceType === AttendanceType.CHECK_IN) {
        remark = (currentTime >= 7 && currentTime <= 8.5) ? AttendanceRemark.ON_TIME : AttendanceRemark.LATE;
    } else { // CHECK_OUT
        remark = (currentTime >= 12 && currentTime <= 14.5) ? AttendanceRemark.ON_TIME : AttendanceRemark.LATE;
    }

    const newRecord: Omit<AttendanceRecord, 'id'> = {
        timestamp: Date.now(),
        userId: currentUser.id, userName: currentUser.name, jenisGtk: currentUser.jenisGtk, statusGtk: currentUser.statusGtk,
        day: new Date().toLocaleDateString('id-ID', { weekday: 'long' }),
        schoolGps: SCHOOL_COORDINATES,
        ...locationData,
        type: currentAttendanceType,
        remark: remark,
        status: keterangan === Keterangan.HADIR ? AttendanceStatus.HADIR : AttendanceStatus.TIDAK_HADIR,
        keterangan: currentAttendanceType === AttendanceType.CHECK_IN ? keterangan : Keterangan.HADIR,
        keteranganIzin: currentAttendanceType === AttendanceType.CHECK_IN && (keterangan === Keterangan.IZIN || keterangan === Keterangan.SAKIT) ? keteranganIzin : undefined,
        notification: 'Valid',
    };

    apiService.addAttendanceRecord(newRecord);
    setSuccess(`Absen ${currentAttendanceType} berhasil direkam!`);
    fetchAttendance();
    setAttendanceState('submitted');
    setTimeout(() => {
        setAttendanceState('idle');
        setKeterangan(Keterangan.HADIR);
        setKeteranganIzin('');
        setLocationData(null);
        setCurrentAttendanceType(null);
    }, 3000);
  };

  const renderAttendanceCard = () => {
    if (attendanceState === 'submitting') {
        return <div className="text-center p-4"><div className="w-8 h-8 border-2 border-dashed rounded-full animate-spin border-blue-500 mx-auto"></div><p className="mt-2 text-sm text-slate-500">Memproses...</p></div>;
    }
    if (attendanceState === 'submitted') {
        return <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4" role="alert"><p>{success}</p></div>;
    }
    if (attendanceState === 'form') {
        return (
            <div className="space-y-4">
                 {locationData && (
                    <div className="text-sm space-y-2 p-3 bg-slate-50 rounded-lg border">
                        <p><strong>Status GPS:</strong> <span className="text-green-600 font-semibold">Aktif</span></p>
                        <p><strong>Alamat:</strong> {locationData.address || 'Memuat...'}</p>
                        <p><strong>Validasi:</strong> <span className={locationData.isWithinRadius ? 'text-green-600 font-bold' : 'text-orange-600 font-bold'}>{locationData.isWithinRadius ? 'Di Dalam Area' : 'Di Luar Area'} ({locationData.distance?.toFixed(2)} km)</span></p>
                    </div>
                 )}
                 {currentAttendanceType === AttendanceType.CHECK_IN && (
                     <>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Keterangan Kehadiran</label>
                            <select value={keterangan} onChange={e => setKeterangan(e.target.value as Keterangan)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                                {KETERANGAN_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        {(keterangan === Keterangan.IZIN || keterangan === Keterangan.SAKIT) && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Alasan Izin/Sakit</label>
                                <textarea value={keteranganIzin} onChange={e => setKeteranganIzin(e.target.value)} rows={2} className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md" placeholder="Tuliskan alasan Anda..."></textarea>
                            </div>
                        )}
                     </>
                 )}
                 {currentAttendanceType === AttendanceType.CHECK_OUT && (
                    <p className="text-center text-slate-600 p-3 bg-slate-100 rounded-md">Anda akan melakukan absensi pulang. Pastikan lokasi Anda sudah benar.</p>
                 )}
                <div className="flex space-x-2">
                     <button onClick={() => setAttendanceState('idle')} className="w-full bg-slate-300 hover:bg-slate-400 text-slate-800 font-bold py-2 px-4 rounded-lg">Batal</button>
                    <button onClick={handleSubmitAttendance} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Kirim Absensi</button>
                </div>
            </div>
        );
    }
    
    // Default 'idle' state
    return (
        <div className="space-y-4">
            {!todayCheckIn ? (
                <button onClick={() => handleStartAttendance(AttendanceType.CHECK_IN)} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 text-lg shadow-md hover:scale-105">
                    Absen Datang
                </button>
            ) : (
                <div className="bg-green-100 text-green-800 p-4 rounded-lg text-center">
                    <p className="font-semibold">Absen Datang hari ini sudah terekam.</p>
                    <p className="text-sm">pukul {new Date(todayCheckIn.timestamp).toLocaleTimeString('id-ID')}</p>
                </div>
            )}

            {!todayCheckOut ? (
                <button onClick={() => handleStartAttendance(AttendanceType.CHECK_OUT)} disabled={!todayCheckIn} className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 text-lg shadow-md hover:scale-105 disabled:bg-slate-300 disabled:cursor-not-allowed">
                    Absen Pulang
                </button>
            ) : (
                 <div className="bg-purple-100 text-purple-800 p-4 rounded-lg text-center">
                    <p className="font-semibold">Absen Pulang hari ini sudah terekam.</p>
                    <p className="text-sm">pukul {new Date(todayCheckOut.timestamp).toLocaleTimeString('id-ID')}</p>
                </div>
            )}
             {todayCheckIn && todayCheckOut && (
                 <div className="bg-blue-100 text-blue-800 p-4 rounded-lg text-center">
                    <p className="font-semibold">Terima kasih, absensi Anda hari ini sudah lengkap.</p>
                </div>
            )}
        </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-md p-4 flex justify-between items-center no-print sticky top-0 z-10">
         <div className="flex items-center space-x-4">
          <img src={SCHOOL_LOGO_PATH} alt="Logo" className="h-12 w-12"/>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Dashboard Guru</h1>
            <p className="text-sm text-slate-500">Selamat datang, {currentUser.name}</p>
          </div>
        </div>
        <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
          Logout
        </button>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        <GeminiMotivation userName={currentUser.name} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg h-fit">
            <h2 className="text-2xl font-bold mb-4 text-slate-800">Absensi Hari Ini</h2>
            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert"><p>{error}</p></div>}
            {renderAttendanceCard()}
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
             <h2 className="text-2xl font-bold text-slate-800 mb-4">Rekap Absensi Saya</h2>
             <div className="bg-slate-50 p-4 rounded-lg border flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <label className="text-sm font-medium text-slate-600">Filter Berdasarkan</label>
                    <select value={filterType} onChange={e => setFilterType(e.target.value as any)} className="mt-1 w-full border-slate-300 rounded-md shadow-sm">
                        <option value="month">Rekap Bulanan</option>
                        <option value="date">Filter Tanggal</option>
                    </select>
                </div>
                {filterType === 'month' ? (
                     <div className="flex-1">
                        <label className="text-sm font-medium text-slate-600">Pilih Bulan</label>
                        <input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="mt-1 w-full border-slate-300 rounded-md shadow-sm"/>
                    </div>
                ) : (
                    <div className="flex-1 grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-sm font-medium text-slate-600">Dari</label>
                            <input type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} className="mt-1 w-full border-slate-300 rounded-md shadow-sm"/>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-600">Sampai</label>
                            <input type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} className="mt-1 w-full border-slate-300 rounded-md shadow-sm"/>
                        </div>
                    </div>
                )}
             </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-4 text-center">
                <div className="bg-green-100 p-3 rounded-lg"><div className="text-2xl font-bold text-green-800">{attendanceSummary.hadir}</div><div className="text-sm text-green-700">Hadir</div></div>
                <div className="bg-yellow-100 p-3 rounded-lg"><div className="text-2xl font-bold text-yellow-800">{attendanceSummary.izin}</div><div className="text-sm text-yellow-700">Izin</div></div>
                <div className="bg-orange-100 p-3 rounded-lg"><div className="text-2xl font-bold text-orange-800">{attendanceSummary.sakit}</div><div className="text-sm text-orange-700">Sakit</div></div>
                <div className="bg-red-100 p-3 rounded-lg"><div className="text-2xl font-bold text-red-800">{attendanceSummary.terlambat}</div><div className="text-sm text-red-700">Terlambat</div></div>
            </div>
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tanggal & Waktu</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tipe</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Keterangan</th>
                       <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Lokasi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {filteredAttendance.length > 0 ? filteredAttendance.map(record => (
                      <tr key={record.id}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900">
                            <div>{new Date(record.timestamp).toLocaleDateString('id-ID', {day:'2-digit', month:'long', year:'numeric'})}</div>
                            <div className="text-xs text-slate-500">{new Date(record.timestamp).toLocaleTimeString('id-ID')}</div>
                        </td>
                         <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.type === AttendanceType.CHECK_IN ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                {record.type}
                            </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.keterangan === Keterangan.HADIR ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {record.keterangan}
                          </span>
                           {record.remark && <span className={`ml-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.remark === AttendanceRemark.ON_TIME ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'}`}>
                                {record.remark}
                            </span>}
                          {record.keteranganIzin && <p className="text-xs text-slate-500 mt-1 max-w-xs truncate" title={record.keteranganIzin}>{record.keteranganIzin}</p>}
                        </td>
                         <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">
                            <div>{record.address || 'Alamat tidak terekam'}</div>
                            <div className="text-xs">{record.isWithinRadius ? 'Dalam Area' : 'Luar Area'} ({record.distance?.toFixed(2)} km)</div>
                         </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-500">Tidak ada data absensi untuk periode yang dipilih.</td></tr>
                    )}
                  </tbody>
                </table>
             </div>
          </div>
        </div>
      </main>
      <GpsInstructionModal isOpen={isGpsModalOpen} onClose={() => setIsGpsModalOpen(false)} onLocationSuccess={handleLocationSuccess} onLocationError={handleLocationError} />
    </div>
  );
};

export default TeacherDashboard;