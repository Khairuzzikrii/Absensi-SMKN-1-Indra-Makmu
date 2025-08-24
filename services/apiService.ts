import { User, UserRole, AttendanceRecord, JenisGTK, StatusGTK } from '../types';

const USERS_KEY = 'attendance_app_users';
const ATTENDANCE_KEY = 'attendance_app_records';
const CURRENT_USER_KEY = 'attendance_app_current_user';

class ApiService {

  constructor() {
    this.seedInitialData();
  }

  seedInitialData() {
    if (!localStorage.getItem(USERS_KEY)) {
      const users: User[] = [
        {
          id: 'admin-01',
          name: 'admin',
          email: 'admin@smkn1.id',
          password: 'smkn1indramakmu',
          role: UserRole.ADMIN,
          jenisGtk: {} as any, // Admin doesn't need this
          statusGtk: {} as any, // Admin doesn't need this
        },
        {
          id: 'teacher-01',
          name: 'Budi Guru',
          email: 'budi@smkn1.id',
          password: 'password123',
          role: UserRole.TEACHER,
          jenisGtk: JenisGTK.GURU_MAPEL,
          statusGtk: StatusGTK.PNS,
        },
      ];
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    if (!localStorage.getItem(ATTENDANCE_KEY)) {
        localStorage.setItem(ATTENDANCE_KEY, JSON.stringify([]));
    }
  }

  // --- Auth ---
  login(username: string, password: string): User {
    const users = this.getUsers();
    // Hardcoded admin login
    if (username.toLowerCase() === 'admin' && password === 'smkn1indramakmu') {
        const adminUser = users.find(u => u.role === UserRole.ADMIN);
        if (adminUser) return adminUser;
    }

    const user = users.find(u => u.name === username && u.password === password && u.role === UserRole.TEACHER);
    if (!user) {
      throw new Error('Username atau password salah.');
    }
    return user;
  }

  register(newUser: Omit<User, 'id'>): User {
    const users = this.getUsers();
    if (users.some(u => u.name === newUser.name && u.role === UserRole.TEACHER)) {
      throw new Error('Username sudah terdaftar.');
    }
    const userWithId: User = { ...newUser, id: `user-${new Date().getTime()}` };
    users.push(userWithId);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return userWithId;
  }
  
  updatePassword(username: string, newPassword: string): User {
    let users = this.getUsers();
    const userIndex = users.findIndex(u => u.name === username && u.role === UserRole.TEACHER);

    if (userIndex === -1) {
        throw new Error('Pengguna tidak ditemukan.');
    }
    
    users[userIndex].password = newPassword;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return users[userIndex];
  }

  // --- Session ---
  setCurrentUser(user: User) {
    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }

  getCurrentUser(): User | null {
    const userJson = sessionStorage.getItem(CURRENT_USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  logout() {
    sessionStorage.removeItem(CURRENT_USER_KEY);
  }

  // --- User CRUD ---
  getUsers(): User[] {
    const usersJson = localStorage.getItem(USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  }

  updateUser(updatedUser: User): User {
    let users = this.getUsers();
    users = users.map(u => (u.id === updatedUser.id ? updatedUser : u));
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return updatedUser;
  }

  deleteUser(userId: string): void {
    let users = this.getUsers();
    users = users.filter(u => u.id !== userId);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Also delete attendance records of the user
    let records = this.getAttendanceRecords();
    records = records.filter(rec => rec.userId !== userId);
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
  }

  // --- Attendance ---
  getAttendanceRecords(): AttendanceRecord[] {
    const recordsJson = localStorage.getItem(ATTENDANCE_KEY);
    return recordsJson ? JSON.parse(recordsJson) : [];
  }

  getAttendanceForUser(userId: string): AttendanceRecord[] {
    return this.getAttendanceRecords().filter(rec => rec.userId === userId);
  }

  addAttendanceRecord(newRecord: Omit<AttendanceRecord, 'id'>): AttendanceRecord {
    const records = this.getAttendanceRecords();
    const recordWithId: AttendanceRecord = { ...newRecord, id: `att-${new Date().getTime()}` };
    records.push(recordWithId);
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
    return recordWithId;
  }
}

export const apiService = new ApiService();