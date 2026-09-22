import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import quotationService from '../services/quotationService';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

const MyQuotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMyQuotations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await quotationService.getMyQuotations();
      if (res.success) {
        setQuotations(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load your quotations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyQuotations();
  }, []);

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">My Submitted Quotations</h2>
          <p className="text-muted mb-0">Track all bids and proposals you have submitted to buyers</p>
        </div>
        <Link to="/supplier" className="btn btn-primary px-3">
          🔍 Browse Open RFQs
        </Link>
      </div>

      {loading ? (
        <Spinner message="Loading your submitted quotations..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchMyQuotations} />
      ) : quotations.length === 0 ? (
        <EmptyState
          title="No quotations submitted yet"
          message="You have not submitted bids on any RFQs yet. Browse open marketplace opportunities and submit competitive proposals to win business."
          actionText="Browse Open RFQs"
          actionLink="/supplier"
        />
      ) : (
        <div className="card shadow-sm border-0 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col" className="ps-4">RFQ Requirement</th>
                  <th scope="col">Quoted Price</th>
                  <th scope="col">Estimated Delivery</th>
                  <th scope="col">Submission Date</th>
                  <th scope="col">RFQ Status</th>
                  <th scope="col" className="text-end pe-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {quotations.map((quote) => {
                  const isExpired = new Date(quote.rfq_deadline) <= new Date();
                  return (
                    <tr key={quote.id}>
                      <td className="ps-4">
                        <Link to={`/supplier/rfq/${quote.rfq_id}`} className="fw-bold text-decoration-none text-dark d-block">
                          {quote.product_service_name}
                        </Link>
                        <small className="text-muted">
                          Qty: {quote.rfq_quantity?.toLocaleString()} | Buyer: {quote.buyer_name}
                        </small>
                      </td>
                      <td>
                        <span className="fw-bold text-success">
                          ${Number(quote.quoted_price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td>
                        <span className="text-muted small fw-semibold">{quote.estimated_delivery_time}</span>
                      </td>
                      <td className="small text-muted">
                        {new Date(quote.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <StatusBadge status={quote.rfq_status} isExpired={isExpired} />
                      </td>
                      <td className="text-end pe-4">
                        <Link to={`/supplier/rfq/${quote.rfq_id}`} className="btn btn-outline-secondary btn-sm">
                          View RFQ
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyQuotations;
