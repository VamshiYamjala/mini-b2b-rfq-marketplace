import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import rfqService from '../services/rfqService';

const CreateRfq = () => {
  const navigate = useNavigate();

  // Default deadline: 14 days from now in YYYY-MM-DD format
  const defaultDate = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    product_service_name: '',
    requirement_description: '',
    quantity: '',
    delivery_location: '',
    deadline: defaultDate
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Minimum deadline date is tomorrow
  const minDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];

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
      errors.product_service_name = 'Product or service name is required';
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
      errors.quantity = 'Quantity must be a positive whole number';
    }

    if (!delivery_location.trim()) {
      errors.delivery_location = 'Delivery location is required';
    } else if (delivery_location.trim().length < 2 || delivery_location.trim().length > 150) {
      errors.delivery_location = 'Must be between 2 and 150 characters';
    }

    if (!deadline) {
      errors.deadline = 'Deadline is required';
    } else {
      const deadlineDate = new Date(deadline);
      if (isNaN(deadlineDate.getTime()) || deadlineDate <= new Date()) {
        errors.deadline = 'Deadline must be strictly in the future';
      }
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
      // Append end of day time to date
      const isoDeadline = new Date(formData.deadline + 'T23:59:59Z').toISOString();
      const payload = {
        product_service_name: formData.product_service_name.trim(),
        requirement_description: formData.requirement_description.trim(),
        quantity: parseInt(formData.quantity, 10),
        delivery_location: formData.delivery_location.trim(),
        deadline: isoDeadline
      };

      const res = await rfqService.createRfq(payload);
      if (res.success) {
        navigate(`/buyer/rfq/${res.data.id}`, { replace: true });
      }
    } catch (err) {
      if (err.errors && Array.isArray(err.errors)) {
        const backendErrors = {};
        err.errors.forEach(item => {
          if (item.field) backendErrors[item.field] = item.message;
        });
        setFieldErrors(backendErrors);
      }
      setGeneralError(err.message || 'Failed to create RFQ. Please review inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <nav aria-label="breadcrumb" className="mb-3">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/buyer">Dashboard</Link></li>
              <li className="breadcrumb-item active" aria-current="page">New RFQ</li>
            </ol>
          </nav>

          <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3 border-bottom">
              <h4 className="card-title fw-bold mb-0">Post a Request for Quotation (RFQ)</h4>
              <small className="text-muted">Fill out your procurement specifications to solicit supplier bids</small>
            </div>
            <div className="card-body p-4">
              {generalError && (
                <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
                  <span className="me-2">⚠️</span>
                  <div>{generalError}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label htmlFor="productName" className="form-label fw-semibold">
                    Product or Service Name <span className="text-danger">*</span>
                  </label>
                  <input
                    id="productName"
                    type="text"
                    name="product_service_name"
                    className={`form-control ${fieldErrors.product_service_name ? 'is-invalid' : ''}`}
                    placeholder="e.g. Industrial Hydraulic Pumps (500 PSI)"
                    value={formData.product_service_name}
                    onChange={handleChange}
                    disabled={submitting}
                    required
                  />
                  {fieldErrors.product_service_name && (
                    <div className="invalid-feedback">{fieldErrors.product_service_name}</div>
                  )}
                  <div className="form-text small">Between 3 and 150 characters.</div>
                </div>

                <div className="mb-3">
                  <label htmlFor="requirementDesc" className="form-label fw-semibold">
                    Detailed Requirements & Specifications <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="requirementDesc"
                    name="requirement_description"
                    rows="5"
                    className={`form-control ${fieldErrors.requirement_description ? 'is-invalid' : ''}`}
                    placeholder="Describe technical specs, certifications (e.g. ISO 9001), packaging, quality standards, warranty terms..."
                    value={formData.requirement_description}
                    onChange={handleChange}
                    disabled={submitting}
                    required
                  ></textarea>
                  {fieldErrors.requirement_description && (
                    <div className="invalid-feedback">{fieldErrors.requirement_description}</div>
                  )}
                  <div className="form-text small">Minimum 10 characters.</div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label htmlFor="quantityInput" className="form-label fw-semibold">
                      Required Quantity <span className="text-danger">*</span>
                    </label>
                    <input
                      id="quantityInput"
                      type="number"
                      name="quantity"
                      min="1"
                      step="1"
                      className={`form-control ${fieldErrors.quantity ? 'is-invalid' : ''}`}
                      placeholder="e.g. 500"
                      value={formData.quantity}
                      onChange={handleChange}
                      disabled={submitting}
                      required
                    />
                    {fieldErrors.quantity && (
                      <div className="invalid-feedback">{fieldErrors.quantity}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="deadlineInput" className="form-label fw-semibold">
                      Submission Deadline <span className="text-danger">*</span>
                    </label>
                    <input
                      id="deadlineInput"
                      type="date"
                      name="deadline"
                      min={minDate}
                      className={`form-control ${fieldErrors.deadline ? 'is-invalid' : ''}`}
                      value={formData.deadline}
                      onChange={handleChange}
                      disabled={submitting}
                      required
                    />
                    {fieldErrors.deadline && (
                      <div className="invalid-feedback">{fieldErrors.deadline}</div>
                    )}
                    <div className="form-text small">Suppliers cannot quote after this date.</div>
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="locationInput" className="form-label fw-semibold">
                    Delivery Location / Destination <span className="text-danger">*</span>
                  </label>
                  <input
                    id="locationInput"
                    type="text"
                    name="delivery_location"
                    className={`form-control ${fieldErrors.delivery_location ? 'is-invalid' : ''}`}
                    placeholder="e.g. Chicago, IL Warehouse 4 (FOB Destination)"
                    value={formData.delivery_location}
                    onChange={handleChange}
                    disabled={submitting}
                    required
                  />
                  {fieldErrors.delivery_location && (
                    <div className="invalid-feedback">{fieldErrors.delivery_location}</div>
                  )}
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <Link to="/buyer" className="btn btn-outline-secondary px-4">
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    className="btn btn-primary px-4 fw-semibold"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Publishing RFQ...
                      </>
                    ) : (
                      'Publish RFQ'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRfq;
