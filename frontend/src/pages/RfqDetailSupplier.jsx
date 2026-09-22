import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import rfqService from '../services/rfqService';
import quotationService from '../services/quotationService';
import StatusBadge from '../components/StatusBadge';
import QuotationForm from '../components/QuotationForm';
import Spinner from '../components/Spinner';
import ErrorState from '../components/ErrorState';

const RfqDetailSupplier = () => {
  const { id } = useParams();
  const [rfq, setRfq] = useState(null);
  const [myQuote, setMyQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [rfqRes, myQuotesRes] = await Promise.all([
        rfqService.getRfqById(id),
        quotationService.getMyQuotations()
      ]);

      if (rfqRes.success) {
        setRfq(rfqRes.data);
      }

      if (myQuotesRes.success && Array.isArray(myQuotesRes.data)) {
        const existing = myQuotesRes.data.find(q => Number(q.rfq_id) === Number(id));
        if (existing) {
          setMyQuote(existing);
        }
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

  const handleQuotationSubmitted = (newQuote) => {
    setMyQuote(newQuote);
    setSubmitSuccess('Your quotation has been successfully submitted and delivered to the buyer!');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <Spinner fullPage message="Loading RFQ specifications..." />;
  if (error) return <div className="container py-5"><ErrorState message={error} onRetry={loadData} /></div>;
  if (!rfq) return null;

  const isExpired = rfq.is_expired || new Date(rfq.deadline) <= new Date();
  const isClosed = rfq.status === 'CLOSED';
  const canQuote = !isClosed && !isExpired && !myQuote;

  return (
    <div className="container py-4">
      {/* Navigation Breadcrumbs */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/supplier">Marketplace</Link></li>
          <li className="breadcrumb-item active" aria-current="page">RFQ #{rfq.id}</li>
        </ol>
      </nav>

      {submitSuccess && (
        <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
          <strong>Success:</strong> {submitSuccess}
          <button type="button" className="btn-close" onClick={() => setSubmitSuccess('')}></button>
        </div>
      )}

      {/* RFQ Specifications Card */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-2">
                <StatusBadge status={rfq.status} isExpired={isExpired} />
                <span className="text-muted small">RFQ #{rfq.id}</span>
              </div>
              <h3 className="fw-bold text-dark mb-1">{rfq.product_service_name}</h3>
              <p className="text-muted small mb-0">Posted by {rfq.buyer_name || 'Verified Buyer'}</p>
            </div>

            <Link to="/supplier" className="btn btn-outline-secondary btn-sm px-3">
              &larr; Back to Browse
            </Link>
          </div>

          <hr className="my-3" />

          {/* Quick specs grid */}
          <div className="row g-3 mb-4">
            <div className="col-sm-4">
              <div className="p-3 bg-light rounded">
                <small className="text-muted d-block fw-semibold text-uppercase">Required Quantity</small>
                <div className="h5 fw-bold mb-0 mt-1">{rfq.quantity.toLocaleString()} units</div>
              </div>
            </div>
            <div className="col-sm-4">
              <div className="p-3 bg-light rounded">
                <small className="text-muted d-block fw-semibold text-uppercase">Delivery Location</small>
                <div className="h6 fw-bold mb-0 mt-1 text-truncate" title={rfq.delivery_location}>
                  {rfq.delivery_location}
                </div>
              </div>
            </div>
            <div className="col-sm-4">
              <div className="p-3 bg-light rounded">
                <small className="text-muted d-block fw-semibold text-uppercase">Submission Deadline</small>
                <div className={`h6 fw-bold mb-0 mt-1 ${isExpired ? 'text-danger' : 'text-dark'}`}>
                  {new Date(rfq.deadline).toLocaleDateString()}
                  {isExpired && ' (Expired)'}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h6 className="fw-bold text-secondary mb-2">Detailed Requirements</h6>
            <div className="p-3 bg-light rounded text-secondary" style={{ whiteSpace: 'pre-line' }}>
              {rfq.requirement_description}
            </div>
          </div>
        </div>
      </div>

      {/* Quotation Submission or Status Section */}
      {myQuote ? (
        <div className="card shadow-sm border-success border-2 mb-4">
          <div className="card-header bg-success text-white py-3">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="card-title fw-bold mb-0">✓ You Have Quoted on this RFQ</h5>
              <span className="badge bg-white text-success fw-bold px-2 py-1">Submitted</span>
            </div>
          </div>
          <div className="card-body p-4">
            <p className="text-muted mb-3">
              Your official quotation has been registered and is under review by the buyer. Per marketplace policy, each supplier may submit only one quotation per RFQ.
            </p>
            <div className="row g-3 p-3 bg-light rounded">
              <div className="col-md-4">
                <small className="text-muted d-block fw-semibold text-uppercase">Your Quoted Price</small>
                <div className="h4 fw-bold text-success mb-0 mt-1">
                  ${Number(myQuote.quoted_price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="col-md-4">
                <small className="text-muted d-block fw-semibold text-uppercase">Delivery Estimate</small>
                <div className="h6 fw-bold text-dark mb-0 mt-1">{myQuote.estimated_delivery_time}</div>
              </div>
              <div className="col-md-4">
                <small className="text-muted d-block fw-semibold text-uppercase">Submission Date</small>
                <div className="h6 text-muted mb-0 mt-1">
                  {myQuote.created_at ? new Date(myQuote.created_at).toLocaleDateString() : 'Today'}
                </div>
              </div>
              {myQuote.message && (
                <div className="col-12 mt-2 pt-2 border-top">
                  <small className="text-muted d-block fw-semibold">Proposal Note:</small>
                  <div className="text-secondary small">{myQuote.message}</div>
                </div>
              )}
            </div>

            <div className="mt-4">
              <Link to="/supplier/my-quotations" className="btn btn-outline-primary btn-sm">
                View All My Quotations &rarr;
              </Link>
            </div>
          </div>
        </div>
      ) : isClosed ? (
        <div className="alert alert-secondary p-4 shadow-sm" role="alert">
          <h5 className="alert-heading fw-bold mb-1">🔒 RFQ is Closed</h5>
          <p className="mb-0">
            The buyer has closed this Request for Quotation. No further supplier quotations are being accepted.
          </p>
        </div>
      ) : isExpired ? (
        <div className="alert alert-warning p-4 shadow-sm" role="alert">
          <h5 className="alert-heading fw-bold mb-1">⏰ Deadline Has Passed</h5>
          <p className="mb-0">
            The submission deadline for this RFQ has expired ({new Date(rfq.deadline).toLocaleDateString()}). New quotations cannot be submitted.
          </p>
        </div>
      ) : (
        <QuotationForm rfqId={rfq.id} onQuotationSubmitted={handleQuotationSubmitted} />
      )}
    </div>
  );
};

export default RfqDetailSupplier;
