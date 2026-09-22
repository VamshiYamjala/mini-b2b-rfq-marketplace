import React from 'react';

const StatusBadge = ({ status, isExpired = false }) => {
  if (status === 'CLOSED') {
    return <span className="badge bg-secondary px-2 py-1">CLOSED</span>;
  }

  if (isExpired) {
    return <span className="badge bg-warning text-dark px-2 py-1">EXPIRED</span>;
  }

  return <span className="badge bg-success px-2 py-1">OPEN</span>;
};

export default StatusBadge;
