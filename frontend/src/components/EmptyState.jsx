import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon = 'bi-inbox',
  title = 'No items found',
  message = 'There are no records to display at this time.',
  actionText,
  actionLink,
  onAction
}) => {
  return (
    <div className="card border-dashed p-5 text-center my-4 bg-light shadow-sm">
      <div className="card-body">
        <div className="mb-3 text-muted" style={{ fontSize: '3rem' }}>
          📭
        </div>
        <h4 className="card-title text-secondary mb-2">{title}</h4>
        <p className="card-text text-muted mb-4" style={{ maxWidth: '480px', margin: '0 auto' }}>
          {message}
        </p>
        {actionText && actionLink && (
          <Link to={actionLink} className="btn btn-primary px-4">
            {actionText}
          </Link>
        )}
        {actionText && onAction && !actionLink && (
          <button onClick={onAction} className="btn btn-primary px-4">
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
