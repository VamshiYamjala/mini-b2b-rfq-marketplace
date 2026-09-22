import React from 'react';

const Spinner = ({ message = 'Loading...', fullPage = false }) => {
  const content = (
    <div className="d-flex flex-column align-items-center justify-content-center p-4">
      <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      {message && <p className="mt-3 text-muted">{message}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
        {content}
      </div>
    );
  }

  return content;
};

export default Spinner;
