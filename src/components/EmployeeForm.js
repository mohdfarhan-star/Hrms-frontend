import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { employeeAPI, handleAPIError } from '../services/api';
import { useToast } from '../context/ToastContext';

const EmployeeForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    employee_id: '',
    full_name: '',
    email: '',
    department: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      fetchEmployee();
    }
  }, [id, isEdit]);

  const fetchEmployee = async () => {
    try {
      setFetchingData(true);
      const response = await employeeAPI.getById(id);
      const employeeData = response.data.data || response.data;
      setFormData({
        employee_id: employeeData.employee_id,
        full_name: employeeData.full_name,
        email: employeeData.email,
        department: employeeData.department,
      });
    } catch (error) {
      const errorInfo = handleAPIError(error);
      showError(errorInfo.message);
      navigate('/employees');
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

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Employee ID validation
    if (!formData.employee_id.trim()) {
      newErrors.employee_id = 'Employee ID is required';
    } else if (!/^[a-zA-Z0-9]+$/.test(formData.employee_id)) {
      newErrors.employee_id = 'Employee ID must contain only letters and numbers';
    }

    // Full name validation
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    } else if (/\d/.test(formData.full_name)) {
      newErrors.full_name = 'Full name cannot contain numbers';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Department validation
    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
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
        await employeeAPI.update(id, formData);
        showSuccess('Employee updated successfully');
      } else {
        await employeeAPI.create(formData);
        showSuccess('Employee created successfully');
      }
      
      navigate('/employees');
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
    navigate('/employees');
  };

  if (fetchingData) {
    return <div className="loading">Loading employee data...</div>;
  }

  return (
    <div className="card">
      <div className="card-header">
        <h1 className="card-title">
          {isEdit ? 'Edit Employee' : 'Add New Employee'}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="employee_id" className="form-label">
              Employee ID *
            </label>
            <input
              type="text"
              id="employee_id"
              name="employee_id"
              className={`form-control ${errors.employee_id ? 'error' : ''}`}
              value={formData.employee_id}
              onChange={handleChange}
              placeholder="e.g., EMP001"
              disabled={loading}
            />
            {errors.employee_id && (
              <div className="form-error">{errors.employee_id}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="department" className="form-label">
              Department *
            </label>
            <input
              type="text"
              id="department"
              name="department"
              className={`form-control ${errors.department ? 'error' : ''}`}
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g., IT, HR, Finance"
              disabled={loading}
            />
            {errors.department && (
              <div className="form-error">{errors.department}</div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="full_name" className="form-label">
            Full Name *
          </label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            className={`form-control ${errors.full_name ? 'error' : ''}`}
            value={formData.full_name}
            onChange={handleChange}
            placeholder="Enter full name"
            disabled={loading}
          />
          {errors.full_name && (
            <div className="form-error">{errors.full_name}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className={`form-control ${errors.email ? 'error' : ''}`}
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email address"
            disabled={loading}
          />
          {errors.email && (
            <div className="form-error">{errors.email}</div>
          )}
        </div>

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
                {isEdit ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                {isEdit ? 'Update Employee' : 'Create Employee'}
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-3">
        <p style={{ fontSize: '0.875rem', color: '#6c757d' }}>
          * Required fields
        </p>
      </div>
    </div>
  );
};

export default EmployeeForm;
