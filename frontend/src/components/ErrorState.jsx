import React from 'react';

const ErrorState = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading this data.',
  onRetry
}) => {
  return (
    <div className="card border-danger p-4 text-center my-4 shadow-sm">
      <div className="card-body">
        <div className="mb-2 text-danger" style={{ fontSize: '2.5rem' }}>
          ⚠️
        </div>
        <h5 className="card-title text-danger">{title}</h5>
        <p className="card-text text-muted mb-3">{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="btn btn-outline-danger btn-sm px-4">
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;
