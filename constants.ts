
import { Coordinates, JenisGTK, StatusGTK, AttendanceStatus, Keterangan } from './types';

export const SCHOOL_COORDINATES: Coordinates = { latitude: 4.3315, longitude: 97.4695 };
export const SCHOOL_RADIUS_KM = 0.5; // 500 meters for more accuracy

export const JENIS_GTK_OPTIONS: JenisGTK[] = [
    JenisGTK.GURU_MAPEL,
    JenisGTK.GURU_BK,
    JenisGTK.GURU_KELAS,
    JenisGTK.KEPALA_SEKOLAH,
    JenisGTK.WAKIL_KEPALA_SEKOLAH,
    JenisGTK.STAFF_TU,
    JenisGTK.PUSTAKAWAN,
    JenisGTK.LABORAN,
];

export const STATUS_GTK_OPTIONS: StatusGTK[] = [
    StatusGTK.PNS,
    StatusGTK.PPPK,
    StatusGTK.GTT,
    StatusGTK.PTT,
    StatusGTK.HONORER,
];

export const ATTENDANCE_STATUS_OPTIONS: AttendanceStatus[] = [
    AttendanceStatus.HADIR,
    AttendanceStatus.TIDAK_HADIR,
];

export const KETERANGAN_OPTIONS: Keterangan[] = [
    Keterangan.HADIR,
    Keterangan.IZIN,
    Keterangan.SAKIT,
];

export const SCHOOL_LOGO_PATH = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhRTV4WKlJawr-qgSyLU1LZTVpj__9eTZsp2ffGhfgKdl_Bmf3me288Glr8BfFCmCYHbJfRGNpDbmOYcqmiOe1QwUUZx8DdGiMa9DKHrgomVylYn1NPdv4I2wqqqfU4FSzruJvBkB4TuNVgyYSNYT7g6NqjeeLGYrT0Uvf5cx3QXl7xOqdPftRSRve719yH/s320/images-removebg-preview%20(1).png";
