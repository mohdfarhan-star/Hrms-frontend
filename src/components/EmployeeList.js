import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { employeeAPI, handleAPIError } from '../services/api';
import { useToast } from '../context/ToastContext';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [departments, setDepartments] = useState([]);
  const { showSuccess, showError } = useToast();

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (departmentFilter) params.department = departmentFilter;

      const response = await employeeAPI.getAll(params);
      
      // Handle different response structures
      let employeeData = [];
      if (response.data) {
        if (response.data.results) {
          // Paginated response
          employeeData = response.data.results;
        } else if (response.data.data) {
          // Custom response with data wrapper
          employeeData = response.data.data;
        } else if (Array.isArray(response.data)) {
          // Direct array response
          employeeData = response.data;
        }
      }

      // Ensure employeeData is always an array
      if (!Array.isArray(employeeData)) {
        employeeData = [];
      }

      setEmployees(employeeData);

      // Extract unique departments for filter
      const uniqueDepartments = [...new Set(employeeData.map(emp => emp.department))];
      setDepartments(uniqueDepartments);
    } catch (error) {
      const errorInfo = handleAPIError(error);
      showError(errorInfo.message);
      setEmployees([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [searchTerm, departmentFilter, showError]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete employee ${name}?`)) {
      try {
        await employeeAPI.delete(id);
        showSuccess(`Employee ${name} deleted successfully`);
        fetchEmployees(); // Refresh the list
      } catch (error) {
        const errorInfo = handleAPIError(error);
        showError(errorInfo.message);
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDepartmentChange = (e) => {
    setDepartmentFilter(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('');
  };

  if (loading) {
    return <div className="loading">Loading employees...</div>;
  }

  return (
    <div className="card">
      <div className="card-header">
        <h1 className="card-title">Employee Management</h1>
        <Link to="/employees/new" className="btn btn-primary">
          Add New Employee
        </Link>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, ID, or email..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="filter-group">
          <select
            className="form-control"
            value={departmentFilter}
            onChange={handleDepartmentChange}
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {(searchTerm || departmentFilter) && (
          <button className="btn btn-secondary" onClick={clearFilters}>
            Clear Filters
          </button>
        )}
      </div>

      {/* Employee Table */}
      {employees.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.employee_id}</td>
                  <td>{employee.full_name}</td>
                  <td>{employee.email}</td>
                  <td>{employee.department}</td>
                  <td>{new Date(employee.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="table-actions">
                      <Link
                        to={`/employees/edit/${employee.id}`}
                        className="btn btn-secondary btn-sm"
                      >
                        Edit
                      </Link>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(employee.id, employee.full_name)}
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
          <div className="empty-state-icon">👥</div>
          <h3 className="empty-state-title">
            {searchTerm || departmentFilter ? 'No employees found' : 'No employees yet'}
          </h3>
          <p className="empty-state-description">
            {searchTerm || departmentFilter 
              ? 'Try adjusting your search criteria or filters.'
              : 'Start by adding your first employee to the system.'
            }
          </p>
          {!(searchTerm || departmentFilter) && (
            <Link to="/employees/new" className="btn btn-primary">
              Add First Employee
            </Link>
          )}
          {(searchTerm || departmentFilter) && (
            <button className="btn btn-secondary" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Summary */}
      {employees.length > 0 && (
        <div className="mt-3">
          <p className="text-center" style={{ color: '#6c757d' }}>
            Showing {employees.length} employee{employees.length !== 1 ? 's' : ''}
            {searchTerm && ` matching "${searchTerm}"`}
            {departmentFilter && ` in ${departmentFilter} department`}
          </p>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
