import React from 'react';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar />
      <main className="flex-grow-1">
        <AppRoutes />
      </main>
      <footer className="bg-white border-top py-3 text-center text-muted small">
        <div className="container">
          &copy; {new Date().getFullYear()} Mini B2B RFQ Marketplace. Built with React, Express, MySQL & Session Auth.
        </div>
      </footer>
    </div>
  );
}

export default App;
