import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { attendanceAPI, employeeAPI, handleAPIError } from '../services/api';
import { useToast } from '../context/ToastContext';

const AttendanceForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    employee: '',
    date: new Date().toISOString().split('T')[0], // Today's date
    status: 'Present',
  });

  const [employees, setEmployees] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEdit);

  useEffect(() => {
    fetchEmployees();
    if (isEdit) {
      fetchAttendanceRecord();
    }
  }, [id, isEdit]);

  const fetchEmployees = async () => {
    try {
      const response = await employeeAPI.getSimpleList();
      const employeeData = response.data.data || response.data;
      setEmployees(employeeData);
    } catch (error) {
      const errorInfo = handleAPIError(error);
      showError(errorInfo.message);
    }
  };

  const fetchAttendanceRecord = async () => {
    try {
      setFetchingData(true);
      const response = await attendanceAPI.getById(id);
      const attendanceData = response.data.data || response.data;
      setFormData({
        employee: attendanceData.employee,
        date: attendanceData.date,
        status: attendanceData.status,
      });
    } catch (error) {
      const errorInfo = handleAPIError(error);
      showError(errorInfo.message);
      navigate('/attendance');
    } finally {
      setFetchingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user makes changes
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Employee validation
    if (!formData.employee) {
      newErrors.employee = 'Please select an employee';
    }

    // Date validation
    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      
      if (selectedDate > today) {
        newErrors.date = 'Attendance date cannot be in the future';
      }
    }

    // Status validation
    if (!formData.status) {
      newErrors.status = 'Please select attendance status';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      if (isEdit) {
        await attendanceAPI.update(id, formData);
        showSuccess('Attendance record updated successfully');
      } else {
        await attendanceAPI.create(formData);
        showSuccess('Attendance marked successfully');
      }
      
      navigate('/attendance');
    } catch (error) {
      const errorInfo = handleAPIError(error);
      
      if (errorInfo.type === 'validation' && errorInfo.errors) {
        setErrors(errorInfo.errors);
      } else {
        showError(errorInfo.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/attendance');
  };

  const getSelectedEmployeeName = () => {
    const selectedEmployee = employees.find(emp => emp.id === parseInt(formData.employee));
    return selectedEmployee ? `${selectedEmployee.employee_id} - ${selectedEmployee.full_name}` : '';
  };

  if (fetchingData) {
    return <div className="loading">Loading attendance data...</div>;
  }

  return (
    <div className="card">
      <div className="card-header">
        <h1 className="card-title">
          {isEdit ? 'Edit Attendance Record' : 'Mark Attendance'}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="employee" className="form-label">
            Employee *
          </label>
          <select
            id="employee"
            name="employee"
            className={`form-control ${errors.employee ? 'error' : ''}`}
            value={formData.employee}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="">Select an employee</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.employee_id} - {employee.full_name} ({employee.department})
              </option>
            ))}
          </select>
          {errors.employee && (
            <div className="form-error">{errors.employee}</div>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date" className="form-label">
              Date *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              className={`form-control ${errors.date ? 'error' : ''}`}
              value={formData.date}
              onChange={handleChange}
              disabled={loading}
              max={new Date().toISOString().split('T')[0]} // Prevent future dates
            />
            {errors.date && (
              <div className="form-error">{errors.date}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="status" className="form-label">
              Status *
            </label>
            <select
              id="status"
              name="status"
              className={`form-control ${errors.status ? 'error' : ''}`}
              value={formData.status}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
            {errors.status && (
              <div className="form-error">{errors.status}</div>
            )}
          </div>
        </div>

        {/* Preview */}
        {formData.employee && formData.date && (
          <div className="card" style={{ backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#495057' }}>
              Preview
            </h3>
            <p style={{ margin: 0, color: '#6c757d' }}>
              Marking <strong>{getSelectedEmployeeName()}</strong> as{' '}
              <span style={{ 
                color: formData.status === 'Present' ? '#28a745' : '#dc3545',
                fontWeight: 'bold'
              }}>
                {formData.status}
              </span>{' '}
              on <strong>{new Date(formData.date).toLocaleDateString()}</strong>
            </p>
          </div>
        )}

        <div className="d-flex gap-2 justify-content-between">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                {isEdit ? 'Updating...' : 'Marking...'}
              </>
            ) : (
              <>
                {isEdit ? 'Update Attendance' : 'Mark Attendance'}
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-3">
        <p style={{ fontSize: '0.875rem', color: '#6c757d' }}>
          * Required fields
        </p>
        {!isEdit && (
          <p style={{ fontSize: '0.875rem', color: '#6c757d' }}>
            Note: You can only mark attendance for today or past dates.
          </p>
        )}
      </div>
    </div>
  );
};

export default AttendanceForm;
