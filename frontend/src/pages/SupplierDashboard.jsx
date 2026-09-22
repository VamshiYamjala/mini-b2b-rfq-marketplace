import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import rfqService from '../services/rfqService';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

const SupplierDashboard = () => {
  const [rfqs, setRfqs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('OPEN');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchRfqs = async (page = currentPage) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 9,
        status: statusFilter || undefined,
        search: searchTerm.trim() || undefined,
        location: locationTerm.trim() || undefined
      };

      const res = await rfqService.getPublicRfqs(params);
      if (res.success) {
        setRfqs(res.data.items);
        setPagination({
          page: res.data.page,
          limit: res.data.limit,
          total: res.data.total,
          totalPages: res.data.totalPages
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to load RFQs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRfqs(1);
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchRfqs(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setLocationTerm('');
    setStatusFilter('OPEN');
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
      fetchRfqs(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="container py-4">
      {/* Page Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Supplier Marketplace</h2>
          <p className="text-muted mb-0">Discover business opportunities and submit competitive quotations</p>
        </div>
        <Link to="/supplier/my-quotations" className="btn btn-outline-primary px-3">
          📋 My Submitted Quotations
        </Link>
      </div>

      {/* Search & Filter Controls Card */}
      <div className="card shadow-sm border-0 mb-4 bg-light">
        <div className="card-body p-4">
          <form onSubmit={handleSearchSubmit}>
            <div className="row g-3">
              <div className="col-md-5">
                <label className="form-label fw-semibold small text-muted">Keyword Search</label>
                <div className="input-group">
                  <span className="input-group-text bg-white">🔍</span>
                  <input
                    type="text"
                    className="form-control bg-white"
                    placeholder="Search by product, material, or keyword..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold small text-muted">Delivery Destination</label>
                <div className="input-group">
                  <span className="input-group-text bg-white">📍</span>
                  <input
                    type="text"
                    className="form-control bg-white"
                    placeholder="e.g. Chicago, Houston..."
                    value={locationTerm}
                    onChange={(e) => setLocationTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-md-3">
                <label className="form-label fw-semibold small text-muted">RFQ Status</label>
                <select
                  className="form-select bg-white"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="OPEN">Open for Bidding</option>
                  <option value="CLOSED">Closed RFQs</option>
                  <option value="">All Statuses</option>
                </select>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-3">
              {(searchTerm || locationTerm || statusFilter !== 'OPEN') && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="btn btn-outline-secondary btn-sm px-3"
                >
                  Reset Filters
                </button>
              )}
              <button type="submit" className="btn btn-primary btn-sm px-4 fw-semibold">
                Apply Filters
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Results Meta */}
      <div className="d-flex justify-content-between align-items-center mb-3 text-muted small">
        <span>
          Showing <strong>{rfqs.length}</strong> of <strong>{pagination.total}</strong> opportunities
        </span>
        {statusFilter === 'OPEN' && (
          <span className="badge bg-success-subtle text-success border border-success">
            Live Opportunities
          </span>
        )}
      </div>

      {/* Main Content */}
      {loading ? (
        <Spinner message="Searching marketplace opportunities..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchRfqs(currentPage)} />
      ) : rfqs.length === 0 ? (
        <EmptyState
          title="No RFQs match your search"
          message="Try adjusting your keyword, location filter, or status selection to find active procurement postings."
          actionText="Clear Filters"
          onAction={handleClearFilters}
        />
      ) : (
        <>
          <div className="row g-4 mb-4">
            {rfqs.map((rfq) => {
              const isExpired = rfq.is_expired || new Date(rfq.deadline) <= new Date();
              const canQuote = rfq.status === 'OPEN' && !isExpired;

              return (
                <div key={rfq.id} className="col-md-6 col-lg-4">
                  <div className="card h-100 shadow-sm border-0 d-flex flex-column hover-shadow">
                    <div className="card-body d-flex flex-column p-4">
                      <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                        <StatusBadge status={rfq.status} isExpired={isExpired} />
                        <span className="text-muted small fw-semibold">
                          {rfq.quotation_count} {rfq.quotation_count === 1 ? 'quote' : 'quotes'}
                        </span>
                      </div>

                      <h5 className="card-title fw-bold text-dark mt-2 mb-2">
                        {rfq.product_service_name}
                      </h5>

                      <p className="card-text text-muted small flex-grow-1 mb-3" style={{ maxHeight: '4.5em', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {rfq.requirement_description}
                      </p>

                      <div className="border-top pt-3 mt-auto">
                        <div className="d-flex justify-content-between small text-muted mb-1">
                          <span>Quantity:</span>
                          <strong className="text-dark">{rfq.quantity.toLocaleString()} units</strong>
                        </div>
                        <div className="d-flex justify-content-between small text-muted mb-1">
                          <span>Destination:</span>
                          <span className="text-dark text-truncate" style={{ maxWidth: '150px' }} title={rfq.delivery_location}>
                            {rfq.delivery_location}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between small text-muted mb-3">
                          <span>Deadline:</span>
                          <strong className={isExpired ? 'text-danger' : 'text-dark'}>
                            {new Date(rfq.deadline).toLocaleDateString()}
                            {isExpired && ' (Passed)'}
                          </strong>
                        </div>

                        <Link
                          to={`/supplier/rfq/${rfq.id}`}
                          className={`btn w-100 fw-semibold ${canQuote ? 'btn-primary' : 'btn-outline-secondary'}`}
                        >
                          {canQuote ? 'View & Submit Quote' : 'View Details'}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="d-flex justify-content-center my-4">
              <nav aria-label="RFQ pagination">
                <ul className="pagination">
                  <li className={`page-item ${pagination.page <= 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(pagination.page - 1)}>
                      Previous
                    </button>
                  </li>
                  {[...Array(pagination.totalPages)].map((_, i) => (
                    <li
                      key={i + 1}
                      className={`page-item ${pagination.page === i + 1 ? 'active' : ''}`}
                    >
                      <button className="page-link" onClick={() => handlePageChange(i + 1)}>
                        {i + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${pagination.page >= pagination.totalPages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(pagination.page + 1)}>
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SupplierDashboard;
