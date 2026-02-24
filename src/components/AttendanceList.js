import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { attendanceAPI, employeeAPI, handleAPIError } from '../services/api';
import { useToast } from '../context/ToastContext';

const AttendanceList = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    employee: '',
    status: '',
    date_from: '',
    date_to: '',
  });
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchEmployees();
    fetchAttendanceRecords();
  }, []);

  useEffect(() => {
    fetchAttendanceRecords();
  }, [filters]);

  const fetchEmployees = async () => {
    try {
      const response = await employeeAPI.getSimpleList();
      
      // Handle different response structures
      let employeeData = [];
      if (response.data) {
        if (response.data.results) {
          employeeData = response.data.results;
        } else if (response.data.data) {
          employeeData = response.data.data;
        } else if (Array.isArray(response.data)) {
          employeeData = response.data;
        }
      }

      // Ensure employeeData is always an array
      if (!Array.isArray(employeeData)) {
        employeeData = [];
      }

      setEmployees(employeeData);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (filters.employee) params.employee = filters.employee;
      if (filters.status) params.status = filters.status;
      if (filters.date_from) params.date_from = filters.date_from;
      if (filters.date_to) params.date_to = filters.date_to;

      const response = await attendanceAPI.getAll(params);
      
      // Handle different response structures
      let attendanceData = [];
      if (response.data) {
        if (response.data.results) {
          // Paginated response
          attendanceData = response.data.results;
        } else if (response.data.data) {
          // Custom response with data wrapper
          attendanceData = response.data.data;
        } else if (Array.isArray(response.data)) {
          // Direct array response
          attendanceData = response.data;
        }
      }

      // Ensure attendanceData is always an array
      if (!Array.isArray(attendanceData)) {
        attendanceData = [];
      }

      setAttendanceRecords(attendanceData);
    } catch (error) {
      const errorInfo = handleAPIError(error);
      showError(errorInfo.message);
      setAttendanceRecords([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, employeeName, date) => {
    if (window.confirm(`Are you sure you want to delete attendance record for ${employeeName} on ${date}?`)) {
      try {
        await attendanceAPI.delete(id);
        showSuccess('Attendance record deleted successfully');
        fetchAttendanceRecords(); // Refresh the list
      } catch (error) {
        const errorInfo = handleAPIError(error);
        showError(errorInfo.message);
      }
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      employee: '',
      status: '',
      date_from: '',
      date_to: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  if (loading) {
    return <div className="loading">Loading attendance records...</div>;
  }

  return (
    <div className="card">
      <div className="card-header">
        <h1 className="card-title">Attendance Management</h1>
        <Link to="/attendance/new" className="btn btn-primary">
          Mark Attendance
        </Link>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <select
            name="employee"
            className="form-control"
            value={filters.employee}
            onChange={handleFilterChange}
          >
            <option value="">All Employees</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.employee_id} - {emp.full_name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select
            name="status"
            className="form-control"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="">All Status</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>
        </div>

        <div className="filter-group">
          <input
            type="date"
            name="date_from"
            className="form-control"
            value={filters.date_from}
            onChange={handleFilterChange}
            placeholder="From Date"
          />
        </div>

        <div className="filter-group">
          <input
            type="date"
            name="date_to"
            className="form-control"
            value={filters.date_to}
            onChange={handleFilterChange}
            placeholder="To Date"
          />
        </div>

        {hasActiveFilters && (
          <button className="btn btn-secondary" onClick={clearFilters}>
            Clear Filters
          </button>
        )}
      </div>

      {/* Attendance Table */}
      {attendanceRecords.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Employee Name</th>
                <th>Department</th>
                <th>Date</th>
                <th>Status</th>
                <th>Recorded At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map((record) => (
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
                  <td>{new Date(record.created_at).toLocaleString()}</td>
                  <td>
                    <div className="table-actions">
                      <Link
                        to={`/attendance/edit/${record.id}`}
                        className="btn btn-secondary btn-sm"
                      >
                        Edit
                      </Link>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(
                          record.id, 
                          record.employee_name, 
                          new Date(record.date).toLocaleDateString()
                        )}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3 className="empty-state-title">
            {hasActiveFilters ? 'No attendance records found' : 'No attendance records yet'}
          </h3>
          <p className="empty-state-description">
            {hasActiveFilters 
              ? 'Try adjusting your filters to see more results.'
              : 'Start by marking attendance for employees.'
            }
          </p>
          {!hasActiveFilters && (
            <Link to="/attendance/new" className="btn btn-primary">
              Mark First Attendance
            </Link>
          )}
          {hasActiveFilters && (
            <button className="btn btn-secondary" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Summary */}
      {attendanceRecords.length > 0 && (
        <div className="mt-3">
          <div className="d-flex justify-content-between align-items-center" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <p style={{ color: '#6c757d', margin: 0 }}>
              Showing {attendanceRecords.length} attendance record{attendanceRecords.length !== 1 ? 's' : ''}
            </p>
            
            {attendanceRecords.length > 0 && (
              <div className="d-flex gap-2" style={{ fontSize: '0.875rem' }}>
                <span style={{ 
                  padding: '0.25rem 0.5rem', 
                  backgroundColor: '#28a745', 
                  color: 'white', 
                  borderRadius: '0.25rem' 
                }}>
                  Present: {attendanceRecords.filter(r => r.status === 'Present').length}
                </span>
                <span style={{ 
                  padding: '0.25rem 0.5rem', 
                  backgroundColor: '#dc3545', 
                  color: 'white', 
                  borderRadius: '0.25rem' 
                }}>
                  Absent: {attendanceRecords.filter(r => r.status === 'Absent').length}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceList;
