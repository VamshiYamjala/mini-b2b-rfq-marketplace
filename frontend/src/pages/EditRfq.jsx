import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import rfqService from '../services/rfqService';
import Spinner from '../components/Spinner';
import ErrorState from '../components/ErrorState';
import StatusBadge from '../components/StatusBadge';

const EditRfq = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    product_service_name: '',
    requirement_description: '',
    quantity: '',
    delivery_location: '',
    deadline: ''
  });
  const [rfqStatus, setRfqStatus] = useState('OPEN');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRfq();
  }, [id]);

  const loadRfq = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await rfqService.getRfqById(id);
      if (res.success) {
        const rfq = res.data;
        setRfqStatus(rfq.status);
        // Format deadline date to YYYY-MM-DD
        const formattedDate = rfq.deadline ? new Date(rfq.deadline).toISOString().split('T')[0] : '';
        setFormData({
          product_service_name: rfq.product_service_name,
          requirement_description: rfq.requirement_description,
          quantity: rfq.quantity,
          delivery_location: rfq.delivery_location,
          deadline: formattedDate
        });
      }
    } catch (err) {
      setFetchError(err.message || 'Failed to load RFQ');
    } finally {
      setLoading(false);
    }
  };

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
    const { product_service_name, requirement_description, quantity, delivery_location, deadline } = formData;

    if (!product_service_name.trim()) {
      errors.product_service_name = 'Product name is required';
    } else if (product_service_name.trim().length < 3 || product_service_name.trim().length > 150) {
      errors.product_service_name = 'Must be between 3 and 150 characters';
    }

    if (!requirement_description.trim()) {
      errors.requirement_description = 'Requirement description is required';
    } else if (requirement_description.trim().length < 10 || requirement_description.trim().length > 2000) {
      errors.requirement_description = 'Must be between 10 and 2000 characters';
    }

    const parsedQty = Number(quantity);
    if (!quantity || !Number.isInteger(parsedQty) || parsedQty <= 0) {
      errors.quantity = 'Quantity must be a positive integer';
    }

    if (!delivery_location.trim()) {
      errors.delivery_location = 'Delivery location is required';
    }

    if (!deadline) {
      errors.deadline = 'Deadline is required';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rfqStatus !== 'OPEN') {
      setGeneralError('Cannot edit an RFQ that is already closed.');
      return;
    }

    setGeneralError('');
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const isoDeadline = new Date(formData.deadline + 'T23:59:59Z').toISOString();
      const payload = {
        product_service_name: formData.product_service_name.trim(),
        requirement_description: formData.requirement_description.trim(),
        quantity: parseInt(formData.quantity, 10),
        delivery_location: formData.delivery_location.trim(),
        deadline: isoDeadline
      };

      const res = await rfqService.updateRfq(id, payload);
      if (res.success) {
        navigate(`/buyer/rfq/${id}`, { replace: true });
      }
    } catch (err) {
      if (err.errors && Array.isArray(err.errors)) {
        const backendErrors = {};
        err.errors.forEach(item => {
          if (item.field) backendErrors[item.field] = item.message;
        });
        setFieldErrors(backendErrors);
      }
      setGeneralError(err.message || 'Failed to update RFQ.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner fullPage message="Loading RFQ..." />;
  if (fetchError) return <div className="container py-4"><ErrorState message={fetchError} onRetry={loadRfq} /></div>;

  const isClosed = rfqStatus === 'CLOSED';

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <nav aria-label="breadcrumb" className="mb-3">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/buyer">Dashboard</Link></li>
              <li className="breadcrumb-item"><Link to={`/buyer/rfq/${id}`}>RFQ #{id}</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Edit</li>
            </ol>
          </nav>

          <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
              <div>
                <h4 className="card-title fw-bold mb-0">Edit RFQ #{id}</h4>
                <small className="text-muted">Update your specifications</small>
              </div>
              <StatusBadge status={rfqStatus} />
            </div>
            <div className="card-body p-4">
              {isClosed && (
                <div className="alert alert-warning mb-4" role="alert">
                  <h6 className="alert-heading fw-bold mb-1">🔒 RFQ is Closed (Read-Only)</h6>
                  <p className="mb-0 small">
                    This RFQ has been closed. Editing is permanently disabled to preserve quotation integrity and audit history for participating suppliers.
                  </p>
                </div>
              )}

              {generalError && (
                <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
                  <span className="me-2">⚠️</span>
                  <div>{generalError}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label htmlFor="productName" className="form-label fw-semibold">
                    Product / Service Name <span className="text-danger">*</span>
                  </label>
                  <input
                    id="productName"
                    type="text"
                    name="product_service_name"
                    className={`form-control ${fieldErrors.product_service_name ? 'is-invalid' : ''}`}
                    value={formData.product_service_name}
                    onChange={handleChange}
                    disabled={isClosed || submitting}
                    required
                  />
                  {fieldErrors.product_service_name && (
                    <div className="invalid-feedback">{fieldErrors.product_service_name}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="requirementDesc" className="form-label fw-semibold">
                    Requirement Description <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="requirementDesc"
                    name="requirement_description"
                    rows="5"
                    className={`form-control ${fieldErrors.requirement_description ? 'is-invalid' : ''}`}
                    value={formData.requirement_description}
                    onChange={handleChange}
                    disabled={isClosed || submitting}
                    required
                  ></textarea>
                  {fieldErrors.requirement_description && (
                    <div className="invalid-feedback">{fieldErrors.requirement_description}</div>
                  )}
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label htmlFor="quantityInput" className="form-label fw-semibold">
                      Quantity <span className="text-danger">*</span>
                    </label>
                    <input
                      id="quantityInput"
                      type="number"
                      name="quantity"
                      min="1"
                      className={`form-control ${fieldErrors.quantity ? 'is-invalid' : ''}`}
                      value={formData.quantity}
                      onChange={handleChange}
                      disabled={isClosed || submitting}
                      required
                    />
                    {fieldErrors.quantity && (
                      <div className="invalid-feedback">{fieldErrors.quantity}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="deadlineInput" className="form-label fw-semibold">
                      Deadline <span className="text-danger">*</span>
                    </label>
                    <input
                      id="deadlineInput"
                      type="date"
                      name="deadline"
                      className={`form-control ${fieldErrors.deadline ? 'is-invalid' : ''}`}
                      value={formData.deadline}
                      onChange={handleChange}
                      disabled={isClosed || submitting}
                      required
                    />
                    {fieldErrors.deadline && (
                      <div className="invalid-feedback">{fieldErrors.deadline}</div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="locationInput" className="form-label fw-semibold">
                    Delivery Location <span className="text-danger">*</span>
                  </label>
                  <input
                    id="locationInput"
                    type="text"
                    name="delivery_location"
                    className={`form-control ${fieldErrors.delivery_location ? 'is-invalid' : ''}`}
                    value={formData.delivery_location}
                    onChange={handleChange}
                    disabled={isClosed || submitting}
                    required
                  />
                  {fieldErrors.delivery_location && (
                    <div className="invalid-feedback">{fieldErrors.delivery_location}</div>
                  )}
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <Link to={`/buyer/rfq/${id}`} className="btn btn-outline-secondary px-4">
                    Back to Details
                  </Link>
                  {!isClosed && (
                    <button
                      type="submit"
                      className="btn btn-primary px-4 fw-semibold"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Saving Changes...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditRfq;
