import React, { useState } from 'react';
import quotationService from '../services/quotationService';

const QuotationForm = ({ rfqId, onQuotationSubmitted }) => {
  const [formData, setFormData] = useState({
    quoted_price: '',
    estimated_delivery_time: '',
    message: ''
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
    const { quoted_price, estimated_delivery_time, message } = formData;

    const priceNum = Number(quoted_price);
    if (!quoted_price || isNaN(priceNum) || priceNum <= 0) {
      errors.quoted_price = 'Quoted price must be a positive number greater than 0';
    } else if (priceNum > 100000000) {
      errors.quoted_price = 'Price cannot exceed $100,000,000';
    }

    if (!estimated_delivery_time.trim()) {
      errors.estimated_delivery_time = 'Estimated delivery time is required';
    } else if (estimated_delivery_time.trim().length < 2 || estimated_delivery_time.trim().length > 60) {
      errors.estimated_delivery_time = 'Must be between 2 and 60 characters (e.g. "5 business days")';
    }

    if (message && message.trim().length > 1000) {
      errors.message = 'Proposal note cannot exceed 1000 characters';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        quoted_price: Number(formData.quoted_price),
        estimated_delivery_time: formData.estimated_delivery_time.trim(),
        message: formData.message.trim() || undefined
      };

      const res = await quotationService.submitQuotation(rfqId, payload);
      if (res.success) {
        if (onQuotationSubmitted) {
          onQuotationSubmitted(res.data);
        }
      }
    } catch (err) {
      if (err.errors && Array.isArray(err.errors)) {
        const backendErrors = {};
        err.errors.forEach(item => {
          if (item.field) backendErrors[item.field] = item.message;
        });
        setFieldErrors(backendErrors);
      }
      setGeneralError(err.message || 'Failed to submit quotation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-primary text-white py-3">
        <h5 className="card-title fw-bold mb-0">Submit Your Quotation Bid</h5>
        <small className="text-white-50">Provide your best competitive pricing and delivery commitment</small>
      </div>
      <div className="card-body p-4">
        {generalError && (
          <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
            <span className="me-2">⚠️</span>
            <div>{generalError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label htmlFor="quotePrice" className="form-label fw-semibold">
                Total Quoted Price (USD) <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text">$</span>
                <input
                  id="quotePrice"
                  type="number"
                  name="quoted_price"
                  step="0.01"
                  min="0.01"
                  className={`form-control ${fieldErrors.quoted_price ? 'is-invalid' : ''}`}
                  placeholder="0.00"
                  value={formData.quoted_price}
                  onChange={handleChange}
                  disabled={submitting}
                  required
                />
                {fieldErrors.quoted_price && (
                  <div className="invalid-feedback">{fieldErrors.quoted_price}</div>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <label htmlFor="deliveryTime" className="form-label fw-semibold">
                Estimated Delivery Time <span className="text-danger">*</span>
              </label>
              <input
                id="deliveryTime"
                type="text"
                name="estimated_delivery_time"
                className={`form-control ${fieldErrors.estimated_delivery_time ? 'is-invalid' : ''}`}
                placeholder="e.g. 7-10 business days"
                value={formData.estimated_delivery_time}
                onChange={handleChange}
                disabled={submitting}
                required
              />
              {fieldErrors.estimated_delivery_time && (
                <div className="invalid-feedback">{fieldErrors.estimated_delivery_time}</div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="quoteMessage" className="form-label fw-semibold">
              Proposal Note / Terms (Optional)
            </label>
            <textarea
              id="quoteMessage"
              name="message"
              rows="3"
              className={`form-control ${fieldErrors.message ? 'is-invalid' : ''}`}
              placeholder="Detail warranty, delivery guarantees, technical specs compliance, or logistics notes..."
              value={formData.message}
              onChange={handleChange}
              disabled={submitting}
              maxLength={1000}
            ></textarea>
            {fieldErrors.message && (
              <div className="invalid-feedback">{fieldErrors.message}</div>
            )}
            <div className="form-text small">Maximum 1000 characters.</div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 fw-semibold"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Submitting Quotation...
              </>
            ) : (
              'Submit Official Quotation'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuotationForm;
