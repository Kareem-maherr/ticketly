import React from 'react';
import { Ticket } from '../types/ticket';

const getSeverityColor = (severity: string) => {
  const severityLower = severity.toLowerCase();
  switch (severityLower) {
    case 'critical':
      return 'text-red-600 bg-red-50';
    case 'high':
      return 'text-orange-600 bg-orange-50';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50';
    case 'low':
      return 'text-green-600 bg-green-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

const PdfDocument: React.FC<{ tickets: Ticket[] }> = ({ tickets }) => {
  if (!tickets || tickets.length === 0) {
    return (
      <div className="text-red-600 bg-red-50 p-8 text-center rounded-lg border border-red-200">
        No ticket data available
      </div>
    );
  }

  return (
    <div className="bg-white">
      {tickets.map((ticket, index) => (
        <div 
          key={ticket.id} 
          className={`min-h-screen ${index < tickets.length - 1 ? 'break-after-page' : ''}`}
          style={{ pageBreakInside: 'avoid' }}
        >
          {/* Header Section */}
          <div className="bg-gradient-to-r from-red-700 to-red-800 p-8 print:break-inside-avoid">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center">
                <div className="w-48">
                  <img 
                    src="/api/placeholder/192/64" 
                    alt="Company Logo"
                    className="w-full h-auto"
                  />
                </div>
                <div className="text-white">
                  <h1 className="text-3xl font-bold mb-2">Ticket Details</h1>
                  <p className="text-lg">#{ticket.id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto p-8 print:break-inside-avoid">
            {/* Info Cards */}
            <div className="grid grid-cols-3 gap-6 mb-8 print:break-inside-avoid">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-gray-600 text-sm mb-2">Status</h3>
                <p className="text-xl font-semibold text-gray-900">{ticket.status}</p>
              </div>
              <div className={`p-6 rounded-lg border border-gray-200 ${getSeverityColor(ticket.severity)}`}>
                <h3 className="text-gray-600 text-sm mb-2">Severity</h3>
                <p className="text-xl font-semibold">{ticket.severity}</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-gray-600 text-sm mb-2">Location</h3>
                <p className="text-xl font-semibold text-gray-900">{ticket.location}</p>
              </div>
            </div>

            {/* Ticket Details */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8 print:break-inside-avoid">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Ticket Information</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm text-gray-600 mb-1">Title</h3>
                    <p className="text-gray-900">{ticket.title}</p>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-600 mb-1">Sender</h3>
                    <p className="text-gray-900">{ticket.sender}</p>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-600 mb-1">Date</h3>
                    <p className="text-gray-900">{ticket.date}</p>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-600 mb-1">Time</h3>
                    <p className="text-gray-900">{ticket.time}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8 print:break-inside-avoid">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Additional Notes</h2>
              </div>
              <div className="p-6">
                <p className="text-gray-700 whitespace-pre-line">{ticket.notes}</p>
              </div>
            </div>

            {/* Terms Section */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8 print:break-inside-avoid">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Terms & Conditions</h2>
              <p className="text-gray-700">This ticket is subject to our standard terms and conditions. Please review all details carefully.</p>
            </div>

            {/* Footer Note */}
            <div className="flex items-center gap-3 text-gray-600 text-sm print:break-inside-avoid">
              <svg className="w-5 h-5 text-red-700" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p>
                <span className="font-semibold">NOTE:</span> This is a computer generated document and does not require physical signature.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-red-800 text-white mt-12 print:break-inside-avoid">
            <div className="max-w-7xl mx-auto px-8 py-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-8">
                  <img 
                    src="/api/placeholder/120/40" 
                    alt="Footer Logo 1"
                    className="h-8 w-auto"
                  />
                  <img 
                    src="/api/placeholder/120/40" 
                    alt="Footer Logo 2"
                    className="h-8 w-auto"
                  />
                </div>
                <p className="text-sm">
                  © {new Date().getFullYear()} Your Company Name. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PdfDocument;