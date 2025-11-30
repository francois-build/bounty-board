
import React from 'react';

const RequestInvoiceModal = ({ show, onClose }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Request an Invoice</h2>
        <p>It seems we're having trouble connecting to our payment processor. You can request a manual invoice to proceed.</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default RequestInvoiceModal;
