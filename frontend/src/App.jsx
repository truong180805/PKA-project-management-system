import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage'
import MainLayout from './components/MainLayout';
import ClassPage from './pages/ClassPage';
import ClassDetailPage from './pages/ClassDetailPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';

const ProjectPage = () => <h2>Trang do an</h2>;

function App() {
  return(
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route path="/" element={<MainLayout />}>

        <Route index element={<Navigate to="dashboard"/>} />
        
        <Route path="dashboard" element={<DashboardPage/>} />
        <Route path="profile" element= {<ProfilePage/>} />
        <Route path="classes" element={<ClassPage/>} />

        <Route path="classes/:id" element={<ClassDetailPage />} />

        <Route path="projects" element={<ProjectPage/>} />
        <Route path="projects/:id" element={<ProjectDetailPage/>} />
        <Route path="users" element={<h2>Trang nguoi dung</h2>} />
      </Route>
    </Routes>
  );
}

export default App;