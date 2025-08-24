
export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
}

export interface User {
  id: string;
  name: string;
  email?: string; 
  password?: string;
  role: UserRole;
  jenisGtk: JenisGTK;
  statusGtk: StatusGTK;
}

export enum JenisGTK {
    GURU_MAPEL = 'Guru Mata Pelajaran',
    GURU_BK = 'Guru Bimbingan Konseling',
    GURU_KELAS = 'Guru Kelas',
    KEPALA_SEKOLAH = 'Kepala Sekolah',
    WAKIL_KEPALA_SEKOLAH = 'Wakil Kepala Sekolah',
    STAFF_TU = 'Staff Tata Usaha',
    PUSTAKAWAN = 'Pustakawan',
    LABORAN = 'Laboran',
}

export enum StatusGTK {
    PNS = 'PNS (Pegawai Negeri Sipil)',
    PPPK = 'PPPK (Pegawai Pemerintah dengan Perjanjian Kerja)',
    GTT = 'GTT (Guru Tidak Tetap)',
    PTT = 'PTT (Pegawai Tidak Tetap)',
    HONORER = 'Honorer',
}

export enum AttendanceStatus {
  HADIR = 'Hadir',
  TIDAK_HADIR = 'Tidak Hadir',
}

export enum Keterangan {
  HADIR = 'Hadir',
  IZIN = 'Izin',
  SAKIT = 'Sakit',
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export enum AttendanceType {
  CHECK_IN = 'Datang',
  CHECK_OUT = 'Pulang',
}

export enum AttendanceRemark {
  ON_TIME = 'Tepat Waktu',
  LATE = 'Terlambat',
}

export interface AttendanceRecord {
  id: string;
  timestamp: number;
  userId: string;
  userName: string;
  jenisGtk: JenisGTK;
  statusGtk: StatusGTK;
  day: string;
  schoolGps: Coordinates;
  employeeGps: Coordinates | null;
  address: string | null;
  isGpsActive: boolean;
  distance: number | null; // in km
  isWithinRadius: boolean;
  status: AttendanceStatus;
  keterangan: Keterangan;
  keteranganIzin?: string;
  notification: 'Valid' | 'Tidak Valid';
  type: AttendanceType;
  remark: AttendanceRemark | null;
}

export type Page = 'login' | 'register' | 'forgot-password';