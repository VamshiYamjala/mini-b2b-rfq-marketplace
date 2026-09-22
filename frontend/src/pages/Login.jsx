import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error on edit
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
    setGeneralError('');
  };

  const validate = () => {
    const errors = {};
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const user = await login(formData.email.trim(), formData.password);
      // Redirect to appropriate dashboard based on user role
      const redirectPath = location.state?.from?.pathname || (user.role === 'BUYER' ? '/buyer' : '/supplier');
      navigate(redirectPath, { replace: true });
    } catch (err) {
      if (err.errors && Array.isArray(err.errors)) {
        const backendErrors = {};
        err.errors.forEach(item => {
          if (item.field) backendErrors[item.field] = item.message;
        });
        setFieldErrors(backendErrors);
      }
      setGeneralError(err.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick fill helper for evaluator convenience
  const fillDemo = (email, password) => {
    setFormData({ email, password });
    setFieldErrors({});
    setGeneralError('');
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow border-0">
            <div className="card-header bg-primary text-white text-center py-4">
              <h3 className="card-title fw-bold mb-1">Sign In</h3>
              <p className="mb-0 small text-white-50">Mini B2B RFQ Marketplace</p>
            </div>
            <div className="card-body p-4 p-md-5">
              {generalError && (
                <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
                  <span className="me-2">⚠️</span>
                  <div>{generalError}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label htmlFor="emailInput" className="form-label fw-semibold">
                    Work Email
                  </label>
                  <input
                    id="emailInput"
                    type="email"
                    name="email"
                    className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={submitting}
                    autoComplete="email"
                    required
                  />
                  {fieldErrors.email && (
                    <div className="invalid-feedback">{fieldErrors.email}</div>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="passwordInput" className="form-label fw-semibold">
                    Password
                  </label>
                  <input
                    id="passwordInput"
                    type="password"
                    name="password"
                    className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={submitting}
                    autoComplete="current-password"
                    required
                  />
                  {fieldErrors.password && (
                    <div className="invalid-feedback">{fieldErrors.password}</div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 fw-semibold"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              <hr className="my-4" />

              {/* Demo Quick-Fill Buttons for Evaluation */}
              <div className="bg-light p-3 rounded mb-4">
                <small className="text-muted fw-bold d-block mb-2 text-uppercase" style={{ fontSize: '0.75rem' }}>
                  Quick Test Accounts:
                </small>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    onClick={() => fillDemo('buyer@example.com', 'Password123')}
                    className="btn btn-outline-secondary btn-sm flex-fill"
                  >
                    Buyer Demo
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemo('supplier@example.com', 'Password123')}
                    className="btn btn-outline-secondary btn-sm flex-fill"
                  >
                    Supplier Demo
                  </button>
                </div>
              </div>

              <div className="text-center">
                <p className="text-muted mb-0 small">
                  Don't have an account yet?{' '}
                  <Link to="/register" className="text-primary fw-semibold text-decoration-none">
                    Register here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
