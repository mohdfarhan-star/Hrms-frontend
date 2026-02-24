import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import EmployeeList from './components/EmployeeList';
import EmployeeForm from './components/EmployeeForm';
import AttendanceList from './components/AttendanceList';
import AttendanceForm from './components/AttendanceForm';
import { ToastProvider } from './context/ToastContext';
import Toast from './components/Toast';

function App() {
  return (
    <ToastProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/employees" element={<EmployeeList />} />
              <Route path="/employees/new" element={<EmployeeForm />} />
              <Route path="/employees/edit/:id" element={<EmployeeForm />} />
              <Route path="/attendance" element={<AttendanceList />} />
              <Route path="/attendance/new" element={<AttendanceForm />} />
              <Route path="/attendance/edit/:id" element={<AttendanceForm />} />
            </Routes>
          </main>
          <Toast />
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
