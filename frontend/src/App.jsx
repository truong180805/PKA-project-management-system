import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage'
import MainLayout from './components/MainLayout';

const DashboardHome = () => <h2>He thong quan ly</h2>;

function App() {
  return(
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={<MainLayout />}>

        <Route index element={<Navigate to="dashboard"/>} />
        
        <Route path="dashboard" element={<DashboardHome/>} />
        <Route path="classes" element={<h2>Trang Quản lý Lớp</h2>} />
        <Route path="projects" element={<h2>Trang Đồ án</h2>} />
        <Route path="users" element={<h2>Trang người dùng</h2>} />
      </Route>
    </Routes>
  );
}

export default App;