import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import rfqService from '../services/rfqService';
import quotationService from '../services/quotationService';
import StatusBadge from '../components/StatusBadge';
import QuotationList from '../components/QuotationList';
import Spinner from '../components/Spinner';
import ErrorState from '../components/ErrorState';

const RfqDetailBuyer = () => {
  const { id } = useParams();
  const [rfq, setRfq] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');
  const [closing, setClosing] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [rfqRes, quotesRes] = await Promise.all([
        rfqService.getRfqById(id),
        quotationService.getRfqQuotations(id)
      ]);

      if (rfqRes.success) {
        setRfq(rfqRes.data);
      }
      if (quotesRes.success) {
        setQuotations(quotesRes.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load RFQ details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleClose = async () => {
    if (!window.confirm('Are you sure you want to close this RFQ? No new quotations will be accepted.')) {
      return;
    }

    setClosing(true);
    try {
      const res = await rfqService.closeRfq(id);
      if (res.success) {
        setRfq(res.data);
        setActionSuccess('RFQ closed successfully. No further quotations will be accepted.');
      }
    } catch (err) {
      alert(err.message || 'Failed to close RFQ');
    } finally {
      setClosing(false);
    }
  };

  if (loading) return <Spinner fullPage message="Loading RFQ specifications and bids..." />;
  if (error) return <div className="container py-5"><ErrorState message={error} onRetry={loadData} /></div>;
  if (!rfq) return null;

  const isExpired = new Date(rfq.deadline) <= new Date();

  return (
    <div className="container py-4">
      {/* Navigation Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/buyer">Dashboard</Link></li>
          <li className="breadcrumb-item active" aria-current="page">RFQ #{rfq.id}</li>
        </ol>
      </nav>

      {actionSuccess && (
        <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
          <strong>Success:</strong> {actionSuccess}
          <button type="button" className="btn-close" onClick={() => setActionSuccess('')}></button>
        </div>
      )}

      {/* Main RFQ Header Card */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-2">
                <StatusBadge status={rfq.status} isExpired={isExpired} />
                <span className="text-muted small">RFQ #{rfq.id}</span>
              </div>
              <h3 className="fw-bold text-dark mb-1">{rfq.product_service_name}</h3>
              <p className="text-muted small mb-0">
                Created on {new Date(rfq.created_at).toLocaleDateString()} by {rfq.buyer_name}
              </p>
            </div>

            {/* Buyer action buttons */}
            <div className="d-flex gap-2">
              {rfq.status === 'OPEN' && (
                <>
                  <Link to={`/buyer/rfq/${rfq.id}/edit`} className="btn btn-outline-primary px-3">
                    Edit RFQ
                  </Link>
                  <button
                    onClick={handleClose}
                    disabled={closing}
                    className="btn btn-outline-danger px-3"
                  >
                    {closing ? 'Closing...' : 'Close RFQ'}
                  </button>
                </>
              )}
            </div>
          </div>

          <hr className="my-3" />

          {/* Specifications Grid */}
          <div className="row g-3 mb-3">
            <div className="col-sm-6 col-md-3">
              <div className="p-3 bg-light rounded">
                <small className="text-muted d-block fw-semibold text-uppercase">Quantity</small>
                <div className="h5 fw-bold mb-0 mt-1">{rfq.quantity.toLocaleString()} units</div>
              </div>
            </div>
            <div className="col-sm-6 col-md-3">
              <div className="p-3 bg-light rounded">
                <small className="text-muted d-block fw-semibold text-uppercase">Deadline</small>
                <div className="h5 fw-bold mb-0 mt-1 text-danger">
                  {new Date(rfq.deadline).toLocaleDateString()}
                </div>
                {isExpired && (
                  <small className="text-danger fw-bold d-block" style={{ fontSize: '0.75rem' }}>
                    Deadline passed
                  </small>
                )}
              </div>
            </div>
            <div className="col-sm-6 col-md-3">
              <div className="p-3 bg-light rounded">
                <small className="text-muted d-block fw-semibold text-uppercase">Delivery Location</small>
                <div className="h6 fw-bold mb-0 mt-1 text-truncate" title={rfq.delivery_location}>
                  {rfq.delivery_location}
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-md-3">
              <div className="p-3 bg-light rounded">
                <small className="text-muted d-block fw-semibold text-uppercase">Quotes Received</small>
                <div className="h5 fw-bold mb-0 mt-1 text-primary">{quotations.length}</div>
              </div>
            </div>
          </div>

          <div>
            <h6 className="fw-bold text-secondary mb-2">Requirement Specifications</h6>
            <div className="p-3 bg-light rounded text-secondary" style={{ whiteSpace: 'pre-line' }}>
              {rfq.requirement_description}
            </div>
          </div>
        </div>
      </div>

      {/* Received Quotations Section */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 className="fw-bold mb-0">Received Quotations ({quotations.length})</h4>
            <small className="text-muted">Review proposals and bids submitted by certified suppliers</small>
          </div>
        </div>

        <QuotationList quotations={quotations} />
      </div>
    </div>
  );
};

export default RfqDetailBuyer;
