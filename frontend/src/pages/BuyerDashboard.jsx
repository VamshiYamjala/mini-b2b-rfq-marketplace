import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import rfqService from '../services/rfqService';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

const BuyerDashboard = () => {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState(''); // '' = all, 'OPEN', 'CLOSED'
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchRfqs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await rfqService.getMyRfqs(statusFilter);
      if (res.success) {
        setRfqs(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load your RFQs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRfqs();
  }, [statusFilter]);

  const handleCloseRfq = async (id, title) => {
    if (!window.confirm(`Are you sure you want to close "${title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await rfqService.closeRfq(id);
      if (res.success) {
        setActionSuccess(`RFQ "${title}" has been successfully closed.`);
        // Refresh list
        fetchRfqs();
      }
    } catch (err) {
      alert(err.message || 'Failed to close RFQ');
    }
  };

  // Metrics summary
  const totalRfqs = rfqs.length;
  const openCount = rfqs.filter(r => r.status === 'OPEN').length;
  const closedCount = rfqs.filter(r => r.status === 'CLOSED').length;
  const totalQuotes = rfqs.reduce((sum, r) => sum + (Number(r.quotation_count) || 0), 0);

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Buyer Dashboard</h2>
          <p className="text-muted mb-0">Manage your procurement requirements and review supplier quotations</p>
        </div>
        <Link to="/buyer/create" className="btn btn-primary px-4 py-2 fw-semibold">
          + Create New RFQ
        </Link>
      </div>

      {actionSuccess && (
        <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
          <strong>Success:</strong> {actionSuccess}
          <button type="button" className="btn-close" onClick={() => setActionSuccess('')}></button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 border-start border-primary border-4">
            <div className="card-body">
              <div className="text-muted small fw-semibold text-uppercase">Total RFQs</div>
              <div className="h3 fw-bold mb-0 mt-1">{totalRfqs}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 border-start border-success border-4">
            <div className="card-body">
              <div className="text-muted small fw-semibold text-uppercase">Open RFQs</div>
              <div className="h3 fw-bold mb-0 mt-1 text-success">{openCount}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 border-start border-secondary border-4">
            <div className="card-body">
              <div className="text-muted small fw-semibold text-uppercase">Closed RFQs</div>
              <div className="h3 fw-bold mb-0 mt-1 text-secondary">{closedCount}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 border-start border-info border-4">
            <div className="card-body">
              <div className="text-muted small fw-semibold text-uppercase">Quotes Received</div>
              <div className="h3 fw-bold mb-0 mt-1 text-info">{totalQuotes}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body py-2 px-3 d-flex justify-content-between align-items-center">
          <span className="fw-semibold small text-muted text-uppercase">Filter Status:</span>
          <div className="btn-group btn-group-sm" role="group">
            <button
              type="button"
              className={`btn ${statusFilter === '' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setStatusFilter('')}
            >
              All
            </button>
            <button
              type="button"
              className={`btn ${statusFilter === 'OPEN' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setStatusFilter('OPEN')}
            >
              Open
            </button>
            <button
              type="button"
              className={`btn ${statusFilter === 'CLOSED' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setStatusFilter('CLOSED')}
            >
              Closed
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <Spinner message="Loading your RFQs..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchRfqs} />
      ) : rfqs.length === 0 ? (
        <EmptyState
          title={statusFilter ? `No ${statusFilter.toLowerCase()} RFQs found` : "You haven't created any RFQs yet"}
          message="Post your first Request for Quotation to start receiving competitive bids from qualified suppliers."
          actionText="+ Create an RFQ"
          actionLink="/buyer/create"
        />
      ) : (
        <div className="card shadow-sm border-0 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col" className="ps-4">Product / Requirement</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">Delivery Location</th>
                  <th scope="col">Deadline</th>
                  <th scope="col">Status</th>
                  <th scope="col">Quotations</th>
                  <th scope="col" className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rfqs.map((rfq) => {
                  const isExpired = new Date(rfq.deadline) <= new Date();
                  return (
                    <tr key={rfq.id}>
                      <td className="ps-4">
                        <Link to={`/buyer/rfq/${rfq.id}`} className="fw-bold text-decoration-none text-dark d-block">
                          {rfq.product_service_name}
                        </Link>
                        <small className="text-muted text-truncate d-inline-block" style={{ maxWidth: '300px' }}>
                          {rfq.requirement_description}
                        </small>
                      </td>
                      <td>
                        <span className="fw-semibold">{rfq.quantity.toLocaleString()}</span>
                      </td>
                      <td className="text-muted small">{rfq.delivery_location}</td>
                      <td className="small">
                        {new Date(rfq.deadline).toLocaleDateString()}
                        {isExpired && rfq.status === 'OPEN' && (
                          <span className="text-danger d-block fw-semibold" style={{ fontSize: '0.75rem' }}>
                            (Passed)
                          </span>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={rfq.status} isExpired={isExpired} />
                      </td>
                      <td>
                        <span className={`badge ${rfq.quotation_count > 0 ? 'bg-primary' : 'bg-light text-muted border'}`}>
                          {rfq.quotation_count} {rfq.quotation_count === 1 ? 'quote' : 'quotes'}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <div className="btn-group btn-group-sm">
                          <Link to={`/buyer/rfq/${rfq.id}`} className="btn btn-outline-secondary">
                            View
                          </Link>
                          {rfq.status === 'OPEN' && (
                            <>
                              <Link to={`/buyer/rfq/${rfq.id}/edit`} className="btn btn-outline-primary">
                                Edit
                              </Link>
                              <button
                                onClick={() => handleCloseRfq(rfq.id, rfq.product_service_name)}
                                className="btn btn-outline-danger"
                              >
                                Close
                              </button>
                            </>
                          )}
                        </div>
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

export default BuyerDashboard;
