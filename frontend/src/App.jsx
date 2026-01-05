import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage'

function App() {
  return(
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/login" />} />
      {/* <Route path= "dashboard" element={<DashboardPage />} /> */}
    </Routes>
  );
}

export default App;