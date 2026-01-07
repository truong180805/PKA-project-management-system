import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage'
import MainLayout from './components/MainLayout';
import ClassPage from './pages/ClassPage';

const DashboardHome = () => <h2>He thong quan ly</h2>;
const ProjectPage = () => <h2>Trang do an</h2>;

function App() {
  return(
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={<MainLayout />}>

        <Route index element={<Navigate to="dashboard"/>} />
        
        <Route path="dashboard" element={<DashboardHome/>} />
        <Route path="classes" element={<ClassPage/>} />
        <Route path="projects" element={<ProjectPage/>} />
        <Route path="users" element={<h2>Trang nguoi dung</h2>} />
      </Route>
    </Routes>
  );
}

export default App;