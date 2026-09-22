import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'BUYER'
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
    setGeneralError('');
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Name / Organization is required';
    } else if (formData.name.trim().length < 2 || formData.name.trim().length > 100) {
      errors.name = 'Name must be between 2 and 100 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email format';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(formData.password)) {
      errors.password = 'Password must be at least 8 characters long and contain both letters and numbers';
    }

    if (!['BUYER', 'SUPPLIER'].includes(formData.role)) {
      errors.role = 'Please select a valid role';
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
      const user = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role
      });
      // Redirect to respective dashboard upon successful registration
      navigate(user.role === 'BUYER' ? '/buyer' : '/supplier', { replace: true });
    } catch (err) {
      if (err.errors && Array.isArray(err.errors)) {
        const backendErrors = {};
        err.errors.forEach(item => {
          if (item.field) backendErrors[item.field] = item.message;
        });
        setFieldErrors(backendErrors);
      }
      setGeneralError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-6">
          <div className="card shadow border-0">
            <div className="card-header bg-primary text-white text-center py-4">
              <h3 className="card-title fw-bold mb-1">Create Account</h3>
              <p className="mb-0 small text-white-50">Join the B2B RFQ Marketplace</p>
            </div>
            <div className="card-body p-4 p-md-5">
              {generalError && (
                <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
                  <span className="me-2">⚠️</span>
                  <div>{generalError}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* Role selection toggle */}
                <div className="mb-4">
                  <label className="form-label fw-semibold d-block mb-2">
                    I am registering as:
                  </label>
                  <div className="row g-2">
                    <div className="col-6">
                      <div
                        className={`card h-100 text-center p-3 cursor-pointer ${
                          formData.role === 'BUYER' ? 'border-primary bg-primary-subtle' : 'border-secondary-subtle'
                        }`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setFormData(prev => ({ ...prev, role: 'BUYER' }))}
                      >
                        <div className="fw-bold text-primary">Buyer</div>
                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                          Post RFQs & receive quotes
                        </small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div
                        className={`card h-100 text-center p-3 cursor-pointer ${
                          formData.role === 'SUPPLIER' ? 'border-primary bg-primary-subtle' : 'border-secondary-subtle'
                        }`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setFormData(prev => ({ ...prev, role: 'SUPPLIER' }))}
                      >
                        <div className="fw-bold text-success">Supplier</div>
                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                          Browse RFQs & submit quotes
                        </small>
                      </div>
                    </div>
                  </div>
                  {fieldErrors.role && (
                    <div className="text-danger small mt-1">{fieldErrors.role}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="nameInput" className="form-label fw-semibold">
                    Company / Full Name
                  </label>
                  <input
                    id="nameInput"
                    type="text"
                    name="name"
                    className={`form-control ${fieldErrors.name ? 'is-invalid' : ''}`}
                    placeholder="Acme Industrial Corp"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={submitting}
                    required
                  />
                  {fieldErrors.name && (
                    <div className="invalid-feedback">{fieldErrors.name}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="emailInput" className="form-label fw-semibold">
                    Work Email
                  </label>
                  <input
                    id="emailInput"
                    type="email"
                    name="email"
                    className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
                    placeholder="procurement@acme.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={submitting}
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
                    placeholder="At least 8 chars with letters and numbers"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={submitting}
                    required
                  />
                  {fieldErrors.password && (
                    <div className="invalid-feedback">{fieldErrors.password}</div>
                  )}
                  <div className="form-text small">
                    Must be at least 8 characters and contain both letters and digits.
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 fw-semibold"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Creating Account...
                    </>
                  ) : (
                    `Register as ${formData.role}`
                  )}
                </button>
              </form>

              <div className="text-center mt-4">
                <p className="text-muted mb-0 small">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary fw-semibold text-decoration-none">
                    Sign in here
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

export default Register;
