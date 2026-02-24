import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI, handleAPIError } from '../services/api';
import { useToast } from '../context/ToastContext';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getSummary();
      
      // Handle different response structures
      let data = null;
      if (response.data) {
        if (response.data.data) {
          data = response.data.data;
        } else {
          data = response.data;
        }
      }
      
      setDashboardData(data);
    } catch (error) {
      const errorInfo = handleAPIError(error);
      showError(errorInfo.message);
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (!dashboardData) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📊</div>
        <h3 className="empty-state-title">Unable to load dashboard</h3>
        <p className="empty-state-description">
          There was an error loading the dashboard data.
        </p>
        <button className="btn btn-primary" onClick={fetchDashboardData}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Dashboard</h1>
        </div>
        
        {/* Statistics Cards */}
        <div className="dashboard-grid">
          <div className="stat-card">
            <div className="stat-number">{dashboardData.total_employees}</div>
            <div className="stat-label">Total Employees</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-number">{dashboardData.total_attendance_records}</div>
            <div className="stat-label">Total Attendance Records</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-number">{dashboardData.today_attendance.present}</div>
            <div className="stat-label">Present Today</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-number">{dashboardData.today_attendance.absent}</div>
            <div className="stat-label">Absent Today</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="card-title">Quick Actions</h2>
          <div className="d-flex gap-2" style={{ flexWrap: 'wrap' }}>
            <Link to="/employees/new" className="btn btn-primary">
              Add New Employee
            </Link>
            <Link to="/attendance/new" className="btn btn-success">
              Mark Attendance
            </Link>
            <Link to="/employees" className="btn btn-outline">
              View All Employees
            </Link>
            <Link to="/attendance" className="btn btn-outline">
              View Attendance Records
            </Link>
          </div>
        </div>

        {/* Department Statistics */}
        {dashboardData.department_stats && dashboardData.department_stats.length > 0 && (
          <div className="card">
            <h2 className="card-title">Department Statistics</h2>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Employee Count</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.department_stats.map((dept, index) => (
                    <tr key={index}>
                      <td>{dept.department}</td>
                      <td>{dept.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Attendance */}
        {dashboardData.recent_attendance && dashboardData.recent_attendance.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Recent Attendance</h2>
              <Link to="/attendance" className="btn btn-outline btn-sm">
                View All
              </Link>
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Employee Name</th>
                    <th>Department</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recent_attendance.map((record) => (
                    <tr key={record.id}>
                      <td>{record.employee_id}</td>
                      <td>{record.employee_name}</td>
                      <td>{record.department}</td>
                      <td>{new Date(record.date).toLocaleDateString()}</td>
                      <td>
                        <span 
                          className={`badge ${
                            record.status === 'Present' ? 'badge-success' : 'badge-danger'
                          }`}
                          style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            backgroundColor: record.status === 'Present' ? '#28a745' : '#dc3545',
                            color: 'white'
                          }}
                        >
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State for Recent Attendance */}
        {(!dashboardData.recent_attendance || dashboardData.recent_attendance.length === 0) && (
          <div className="card">
            <h2 className="card-title">Recent Attendance</h2>
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <h3 className="empty-state-title">No attendance records yet</h3>
              <p className="empty-state-description">
                Start by marking attendance for employees.
              </p>
              <Link to="/attendance/new" className="btn btn-primary">
                Mark Attendance
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
