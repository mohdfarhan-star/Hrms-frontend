import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    return path !== '/' && location.pathname.startsWith(path);
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          HRMS Lite
        </Link>
        <ul className="navbar-nav">
          <li>
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link 
              to="/employees" 
              className={`nav-link ${isActive('/employees') ? 'active' : ''}`}
            >
              Employees
            </Link>
          </li>
          <li>
            <Link 
              to="/attendance" 
              className={`nav-link ${isActive('/attendance') ? 'active' : ''}`}
            >
              Attendance
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
