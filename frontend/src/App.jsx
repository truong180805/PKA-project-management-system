import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd'; 
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MainLayout from './components/MainLayout';
import ClassPage from './pages/ClassPage';
import ClassDetailPage from './pages/ClassDetailPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ProjectsPage from './pages/ProjectsPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import CalendarPage from './pages/calendarPage';
import SettingsPage from './pages/SettingsPage';
import SupportPage from './pages/SupportPage';
import InboxPage from './pages/InboxPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

import ClassLayout from './components/ClassLayout';
import ClassStreamPage from './pages/class/ClassStreamPage';
import ClassPeoplePage from './pages/class/ClassPeoplePage';
import ClassTopicsPage from './pages/class/ClassTopicsPage';
import ClassGroupsPage from './pages/class/ClassGroupsPage';
import ClassAssignmentsPage from './pages/class/ClassAssignmentsPage';
import ClassMaterialsPage from './pages/class/ClassMaterialsPage';
import ClassGradesPage from './pages/class/ClassGradesPage';


const AppContent = () => {
  const { isDarkMode } = useTheme();

  return(
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm, // THUẬT TOÁN ĐỔI MÀU
        token: {
          colorPrimary: '#1890ff', // Màu chủ đạo
        },
      }}
    >
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="dashboard"/>} />
        <Route path="dashboard" element={<DashboardPage/>} />
        <Route path="profile" element= {<ProfilePage/>} />
        <Route path="projects/:id" element={<ProjectDetailPage/>} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="support" element={<SupportPage />} />
        <Route path="inbox" element={<InboxPage />} />
        <Route path="projects" element={<ProjectsPage />} />

        <Route path="classes" element={<ClassPage/>} />

        <Route path="classes/:id" element={<ClassLayout />}>
            <Route index element={<ClassStreamPage />} />       {/* Bảng tin (Mặc định) */}
            <Route path="people" element={<ClassPeoplePage />} />
            <Route path="topics" element={<ClassTopicsPage />} />
            <Route path="groups" element={<ClassGroupsPage />} />
            <Route path="assignments" element={<ClassAssignmentsPage />} />
            <Route path="materials" element={<ClassMaterialsPage />} />
            <Route path="grades" element={<ClassGradesPage />} />
        </Route>
      </Route>
    </Routes>
    </ConfigProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;