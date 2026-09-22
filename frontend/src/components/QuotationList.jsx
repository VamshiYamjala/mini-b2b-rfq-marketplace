import React from 'react';

const QuotationList = ({ quotations = [] }) => {
  if (!quotations || quotations.length === 0) {
    return (
      <div className="card bg-light border-dashed p-4 text-center">
        <p className="text-muted mb-0">No quotations received for this RFQ yet.</p>
        <small className="text-muted">Qualified suppliers will submit bids here before the deadline.</small>
      </div>
    );
  }

  // Find lowest bid for visual highlight
  const lowestPrice = Math.min(...quotations.map(q => Number(q.quoted_price)));

  return (
    <div className="row g-3">
      {quotations.map((quote) => {
        const isLowest = Number(quote.quoted_price) === lowestPrice && quotations.length > 1;
        return (
          <div key={quote.id} className="col-12">
            <div className={`card shadow-sm border-0 ${isLowest ? 'border-start border-success border-4' : ''}`}>
              <div className="card-body p-4">
                <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
                  <div>
                    <h5 className="fw-bold mb-1 text-dark">
                      ${Number(quote.quoted_price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      {isLowest && (
                        <span className="badge bg-success-subtle text-success border border-success ms-2 small">
                          Lowest Bid
                        </span>
                      )}
                    </h5>
                    <div className="text-muted small">
                      Estimated Delivery:{' '}
                      <strong className="text-dark">{quote.estimated_delivery_time}</strong>
                    </div>
                  </div>
                  <div className="text-end">
                    <span className="badge bg-light text-dark border px-2 py-1">
                      Submitted: {new Date(quote.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <hr className="my-2" />

                <div className="d-flex flex-wrap justify-content-between align-items-center mt-2">
                  <div>
                    <small className="text-muted d-block">Supplier:</small>
                    <span className="fw-semibold text-primary">{quote.supplier_name || 'Verified Supplier'}</span>
                    {quote.supplier_email && (
                      <span className="text-muted small ms-2">({quote.supplier_email})</span>
                    )}
                  </div>
                </div>

                {quote.message && (
                  <div className="mt-3 p-3 bg-light rounded text-secondary small">
                    <strong>Proposal Note:</strong> {quote.message}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default QuotationList;
