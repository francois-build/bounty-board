
import { useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider, QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";

import Home from "./pages/Home.jsx";
import BrowseChallenges from "./pages/BrowseChallenges.jsx";
import RequestInvoiceModal from "./components/RequestInvoiceModal.jsx";

import './index.css';

const queryClient = new QueryClient();

function App() {
  const [showModal, setShowModal] = useState(false);

  const handleError = (error, reset) => {
    // In a real app, you would log the error to a service
    console.error(error);
    // For now, we'll just show the modal
    setShowModal(true);
    // reset(); // You might want to reset the query state
  }

  return (
    <>
      <RequestInvoiceModal show={showModal} onClose={() => setShowModal(false)} />
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary onReset={reset} onError={handleError}>
            <QueryClientProvider client={queryClient}>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/browse" element={<BrowseChallenges />} />
                </Routes>
              </BrowserRouter>
            </QueryClientProvider>
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </>
  );
}

export default App;


