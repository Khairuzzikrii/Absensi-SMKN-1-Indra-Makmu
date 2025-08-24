
import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole, Page } from './types';
import { apiService } from './services/apiService';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import LoadingScreen from './components/LoadingScreen';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('login');

  useEffect(() => {
    apiService.seedInitialData();
    const storedUser = apiService.getCurrentUser();
    if (storedUser) {
      setCurrentUser(storedUser);
    }
    setTimeout(() => setIsLoading(false), 1500); 
  }, []);

  const handleLogin = useCallback((user: User) => {
    setCurrentUser(user);
    apiService.setCurrentUser(user);
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    apiService.logout();
    setCurrentPage('login');
  }, []);

  const handleNavigate = (page: Page, options?: { username?: string }) => {
    if (page === 'login' && options?.username) {
        sessionStorage.setItem('registered_username', options.username);
    }
    setCurrentPage(page);
  };

  const renderPage = () => {
    if (currentUser) {
      if (currentUser.role === UserRole.ADMIN) {
        return <AdminDashboard currentUser={currentUser} onLogout={handleLogout} />;
      }
      return <TeacherDashboard currentUser={currentUser} onLogout={handleLogout} />;
    }

    switch (currentPage) {
      case 'login':
        return <LoginPage onLogin={handleLogin} onNavigate={handleNavigate} />;
      case 'register':
        return <RegisterPage onNavigate={handleNavigate} />;
      case 'forgot-password':
        return <ForgotPasswordPage onNavigate={handleNavigate} />;
      default:
        return <LoginPage onLogin={handleLogin} onNavigate={handleNavigate} />;
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased">
        {renderPage()}
    </div>
  );
};

export default App;
