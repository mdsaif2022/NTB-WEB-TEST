import React from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import TourManagement from './TourManagement';

// Custom error handler for TourManagement
const handleTourManagementError = (error: Error, errorInfo: React.ErrorInfo) => {
  console.error('TourManagement Error:', error, errorInfo);
  
  // You can add custom error reporting here
  // Example: send error to monitoring service
  // errorReportingService.captureException(error, { extra: errorInfo });
};

// Custom fallback UI for TourManagement
const TourManagementFallback = (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
    <div className="w-full max-w-md">
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Tour Management Error</h2>
        <p className="text-gray-600 mb-4">
          There was an issue loading the tour management page. Please try refreshing the page.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    </div>
  </div>
);

export default function TourManagementWrapper() {
  return (
    <ErrorBoundary
      onError={handleTourManagementError}
      fallback={TourManagementFallback}
    >
      <TourManagement />
    </ErrorBoundary>
  );
}
