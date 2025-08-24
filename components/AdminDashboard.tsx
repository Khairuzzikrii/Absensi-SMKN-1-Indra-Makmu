
import React, { useState, useEffect, useMemo } from 'react';
import { User, AttendanceRecord, UserRole, JenisGTK, StatusGTK, Keterangan, AttendanceType, AttendanceRemark } from '../types';
import { apiService } from '../services/apiService';
import { exportService } from '../services/exportService';
import { SCHOOL_LOGO_PATH, JENIS_GTK_OPTIONS, STATUS_GTK_OPTIONS } from '../constants';
import GeminiMotivation from './GeminiMotivation';

interface AdminDashboardProps {
  currentUser: User;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, onLogout }) => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const fetchData = () => {
    setAttendanceRecords(apiService.getAttendanceRecords());
    setUsers(apiService.getUsers().filter(u => u.role === UserRole.TEACHER));
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-md p-4 flex justify-between items-center no-print sticky top-0 z-20">
        <div className="flex items-center space-x-4">
          <img src={SCHOOL_LOGO_PATH} alt="Logo" className="h-12 w-12"/>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Dashboard Admin</h1>
            <p className="text-sm text-slate-500">Selamat datang, {currentUser.name}</p>
          </div>
        </div>
        <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
          Logout
        </button>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        <GeminiMotivation userName={currentUser.name} />
        <ReportsSection users={users} attendanceRecords={attendanceRecords} />
      </main>
    </div>
  );
};


const ReportsSection: React.FC<{ users: User[], attendanceRecords: AttendanceRecord[] }> = ({ users, attendanceRecords }) => {
    const [activeTab, setActiveTab] = useState<'monthly' | 'daily' | 'employee'>('monthly');

    // State for filters
    const [monthlyFilter, setMonthlyFilter] = useState(new Date().toISOString().slice(0, 7));
    const [dailyStartFilter, setDailyStartFilter] = useState(new Date().toISOString().slice(0, 10));
    const [dailyEndFilter, setDailyEndFilter] = useState(new Date().toISOString().slice(0, 10));
    const [employeeFilter, setEmployeeFilter] = useState('');
    const [employeeMonthFilter, setEmployeeMonthFilter] = useState('');

    const monthlyReportData = useMemo(() => {
        if (!monthlyFilter) return [];
        const filteredRecords = attendanceRecords.filter(r => new Date(r.timestamp).toISOString().slice(0, 7) === monthlyFilter && r.type === AttendanceType.CHECK_IN);
        const userStats: { [userId: string]: { name: string; hadir: number; izin: number; sakit: number; terlambat: number; total: number } } = {};

        for (const user of users) {
            userStats[user.id] = { name: user.name, hadir: 0, izin: 0, sakit: 0, terlambat: 0, total: 0 };
        }

        filteredRecords.forEach(rec => {
            if (userStats[rec.userId]) {
                if (rec.keterangan === Keterangan.HADIR) userStats[rec.userId].hadir++;
                if (rec.keterangan === Keterangan.IZIN) userStats[rec.userId].izin++;
                if (rec.keterangan === Keterangan.SAKIT) userStats[rec.userId].sakit++;
                if (rec.remark === AttendanceRemark.LATE) userStats[rec.userId].terlambat++;
            }
        });
        
        const totalDaysInMonth = new Date(parseInt(monthlyFilter.slice(0,4)), parseInt(monthlyFilter.slice(5,7)), 0).getDate();
        
        return Object.values(userStats).map(stat => {
            return { ...stat, persentase: totalDaysInMonth > 0 ? ((stat.hadir / totalDaysInMonth) * 100).toFixed(1) + '%' : '0.0%' }
        }).sort((a,b) => a.name.localeCompare(b.name));
    }, [monthlyFilter, attendanceRecords, users]);

    const dailyReportData = useMemo(() => {
        if (!dailyStartFilter || !dailyEndFilter) return [];
        const start = new Date(dailyStartFilter).getTime();
        const end = new Date(dailyEndFilter).setHours(23, 59, 59, 999);
        return attendanceRecords.filter(r => r.timestamp >= start && r.timestamp <= end).sort((a,b) => b.timestamp - a.timestamp);
    }, [dailyStartFilter, dailyEndFilter, attendanceRecords]);
    
    const employeeReportData = useMemo(() => {
        if (!employeeFilter) return { summary: null, records: [] };
        let records = attendanceRecords.filter(r => r.userId === employeeFilter);
        if (employeeMonthFilter) {
            records = records.filter(r => new Date(r.timestamp).toISOString().slice(0, 7) === employeeMonthFilter);
        }
        
        const checkInRecords = records.filter(r => r.type === AttendanceType.CHECK_IN);
        const summary = checkInRecords.reduce((acc, rec) => {
            if (rec.keterangan === Keterangan.HADIR) acc.hadir++;
            if (rec.keterangan === Keterangan.IZIN) acc.izin++;
            if (rec.keterangan === Keterangan.SAKIT) acc.sakit++;
            if (rec.remark === AttendanceRemark.LATE) acc.terlambat++;
            acc.total++;
            return acc;
        }, { hadir: 0, izin: 0, sakit: 0, total: 0, terlambat: 0 });
        
        return { summary, records: records.sort((a,b) => b.timestamp - a.timestamp) };
    }, [employeeFilter, employeeMonthFilter, attendanceRecords]);

    const renderTabs = () => (
        <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                <button onClick={() => setActiveTab('monthly')} className={`${activeTab === 'monthly' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>📅 Rekap Bulanan</button>
                <button onClick={() => setActiveTab('daily')} className={`${activeTab === 'daily' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>📊 Filter Tanggal</button>
                <button onClick={() => setActiveTab('employee')} className={`${activeTab === 'employee' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>👤 Rekap Per Pegawai</button>
            </nav>
        </div>
    );
    
    const getMonthName = (monthStr: string) => new Date(monthStr + '-02').toLocaleString('id-ID', { month: 'long', year: 'numeric' });

    const dailyReportColumns = [
        {header: 'Waktu', dataKey: 'timestamp' as keyof AttendanceRecord}, 
        {header: 'Nama', dataKey: 'userName'  as keyof AttendanceRecord},
        {header: 'Tipe', dataKey: 'type' as keyof AttendanceRecord},
        {header: 'Status Waktu', dataKey: 'remark' as keyof AttendanceRecord},
        {header: 'Alamat', dataKey: 'address' as keyof AttendanceRecord},
        {header: 'Keterangan', dataKey: 'keteranganIzin' as keyof AttendanceRecord},
    ];

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
            <h2 className="text-2xl font-bold text-slate-800">Laporan Absensi</h2>
            {renderTabs()}
            
            <div className="pt-4">
                {activeTab === 'monthly' && (
                    <div>
                        <div className="flex flex-wrap items-end gap-4 mb-4 bg-slate-50 p-3 rounded-lg border">
                            <div><label className="text-sm font-medium text-slate-600">Pilih Bulan</label><input type="month" value={monthlyFilter} onChange={e => setMonthlyFilter(e.target.value)} className="mt-1 w-full border-slate-300 rounded-md"/></div>
                            <button onClick={() => exportService.exportToCSV(monthlyReportData, `rekap_bulanan_${monthlyFilter}`, ["name", "hadir", "izin", "sakit", "terlambat", "persentase"])} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-sm">Export CSV</button>
                            <button onClick={() => exportService.exportReportToPDF(monthlyReportData, `Rekap Bulanan`, [{header: 'Nama', dataKey: 'name'}, {header: 'Hadir', dataKey: 'hadir'}, {header: 'Izin', dataKey: 'izin'}, {header: 'Sakit', dataKey: 'sakit'}, {header: 'Terlambat', dataKey: 'terlambat'}, {header: '% Hadir', dataKey: 'persentase'}], { subtitle: `Periode: ${getMonthName(monthlyFilter)}` })} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-sm">Export PDF</button>
                        </div>
                        <div className="overflow-x-auto"><table className="min-w-full divide-y divide-slate-200"><thead className="bg-slate-50"><tr>{["Nama", "Hadir", "Izin", "Sakit", "Terlambat", "% Hadir"].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-200">{monthlyReportData.map(d=><tr key={d.name}><td className="px-4 py-2 font-medium">{d.name}</td><td className="px-4 py-2">{d.hadir}</td><td className="px-4 py-2">{d.izin}</td><td className="px-4 py-2">{d.sakit}</td><td className="px-4 py-2 text-red-600 font-semibold">{d.terlambat}</td><td className="px-4 py-2 font-semibold">{d.persentase}</td></tr>)}</tbody></table></div>
                    </div>
                )}
                {activeTab === 'daily' && (
                    <div>
                        <div className="flex flex-wrap items-end gap-4 mb-4 bg-slate-50 p-3 rounded-lg border">
                            <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4"><label className="text-sm font-medium text-slate-600 col-span-full">Pilih Rentang Tanggal</label>
                            <div><label className="text-xs">Dari Tanggal</label><input type="date" value={dailyStartFilter} onChange={e => setDailyStartFilter(e.target.value)} className="w-full border-slate-300 rounded-md"/></div>
                            <div><label className="text-xs">Sampai Tanggal</label><input type="date" value={dailyEndFilter} onChange={e => setDailyEndFilter(e.target.value)} className="w-full border-slate-300 rounded-md"/></div></div>
                            <button onClick={() => exportService.exportToCSV(dailyReportData, `laporan_harian_${dailyStartFilter}_${dailyEndFilter}`)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-sm">Export CSV</button>
                            <button onClick={() => exportService.exportReportToPDF(dailyReportData, `Laporan Harian`, dailyReportColumns, { subtitle: `Periode: ${dailyStartFilter} s/d ${dailyEndFilter}` })} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-sm">Export PDF</button>
                        </div>
                        <div className="overflow-x-auto"><table className="min-w-full divide-y divide-slate-200"><thead className="bg-slate-50"><tr>{dailyReportColumns.map(c=><th key={c.header} className="px-4 py-3 text-left text-xs font-medium uppercase">{c.header}</th>)}</tr></thead><tbody className="divide-y divide-slate-200">{dailyReportData.map(d=><tr key={d.id}><td className="px-4 py-2">{new Date(d.timestamp).toLocaleString('id-ID')}</td><td className="px-4 py-2">{d.userName}</td><td className="px-4 py-2">{d.type}</td><td className="px-4 py-2">{d.remark}</td><td className="px-4 py-2">{d.address}</td><td className="px-4 py-2">{d.keterangan}{d.keteranganIzin ? ` (${d.keteranganIzin})` : ''}</td></tr>)}</tbody></table></div>
                    </div>
                )}
                {activeTab === 'employee' && (
                    <div>
                        <div className="flex flex-wrap items-end gap-4 mb-4 bg-slate-50 p-3 rounded-lg border">
                            <div><label className="text-sm font-medium text-slate-600">Pilih Pegawai</label><select value={employeeFilter} onChange={e=>setEmployeeFilter(e.target.value)} className="mt-1 w-full border-slate-300 rounded-md"><option value="">-- Pilih Pegawai --</option>{users.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
                            <div><label className="text-sm font-medium text-slate-600">Bulan (Opsional)</label><input type="month" value={employeeMonthFilter} onChange={e=>setEmployeeMonthFilter(e.target.value)} className="mt-1 w-full border-slate-300 rounded-md"/></div>
                            <button onClick={() => exportService.exportToCSV(employeeReportData.records, `rekap_pegawai_${employeeFilter}`)} disabled={!employeeFilter} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-sm disabled:bg-slate-300">Export CSV</button>
                            <button onClick={() => exportService.exportReportToPDF(employeeReportData.records, `Rekap Pegawai`, dailyReportColumns, { subtitle: `Pegawai: ${users.find(u=>u.id===employeeFilter)?.name}` })} disabled={!employeeFilter} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-sm disabled:bg-slate-300">Export PDF</button>
                        </div>
                        {employeeFilter && employeeReportData.summary && <div className="grid grid-cols-2 md:grid-cols-5 gap-4 my-4 text-center">
                            <div className="bg-green-100 p-3 rounded-lg"><div className="text-2xl font-bold text-green-800">{employeeReportData.summary.hadir}</div><div className="text-sm">Hadir</div></div>
                            <div className="bg-yellow-100 p-3 rounded-lg"><div className="text-2xl font-bold text-yellow-800">{employeeReportData.summary.izin}</div><div className="text-sm">Izin</div></div>
                            <div className="bg-orange-100 p-3 rounded-lg"><div className="text-2xl font-bold text-orange-800">{employeeReportData.summary.sakit}</div><div className="text-sm">Sakit</div></div>
                            <div className="bg-red-100 p-3 rounded-lg"><div className="text-2xl font-bold text-red-800">{employeeReportData.summary.terlambat}</div><div className="text-sm">Terlambat</div></div>
                            <div className="bg-slate-100 p-3 rounded-lg"><div className="text-2xl font-bold text-slate-800">{employeeReportData.summary.total}</div><div className="text-sm">Total Hari</div></div>
                        </div>}
                        <div className="overflow-x-auto"><table className="min-w-full divide-y divide-slate-200"><thead className="bg-slate-50"><tr>{dailyReportColumns.map(c=><th key={c.header} className="px-4 py-3 text-left text-xs font-medium uppercase">{c.header}</th>)}</tr></thead><tbody className="divide-y divide-slate-200">{!employeeFilter ? (<tr><td colSpan={dailyReportColumns.length} className="text-center py-10 text-slate-500">Silakan pilih pegawai untuk melihat rekap.</td></tr>) : employeeReportData.records.length > 0 ? employeeReportData.records.map(d=><tr key={d.id}><td className="px-4 py-2">{new Date(d.timestamp).toLocaleString('id-ID')}</td><td className="px-4 py-2">{d.userName}</td><td className="px-4 py-2">{d.type}</td><td className="px-4 py-2">{d.remark}</td><td className="px-4 py-2">{d.address}</td><td className="px-4 py-2">{d.keterangan}{d.keteranganIzin ? ` (${d.keteranganIzin})` : ''}</td></tr>) : (<tr><td colSpan={dailyReportColumns.length} className="text-center py-10 text-slate-500">Tidak ada data untuk pegawai ini.</td></tr>)}</tbody></table></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;