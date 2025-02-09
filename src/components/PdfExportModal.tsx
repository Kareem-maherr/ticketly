import React, { useState, useRef } from 'react';
import { Ticket } from '../types/ticket';
import html2pdf from 'html2pdf.js';
import PdfDocument from './PdfDocument';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tickets: Ticket[];
}

const PdfExportModal: React.FC<PdfExportModalProps> = ({ isOpen, onClose, tickets }) => {
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleSelectAll = () => {
    if (selectedTickets.length === tickets.length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(tickets.map(ticket => ticket.id));
    }
  };

  const handleTicketSelect = (ticketId: string) => {
    setSelectedTickets(prev =>
      prev.includes(ticketId)
        ? prev.filter(id => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const generatePdf = () => {
    if (selectedTickets.length === 0) {
      alert('Please select at least one ticket');
      return;
    }

    const selectedTicketsData = tickets.filter(ticket => selectedTickets.includes(ticket.id));
    const element = pdfRef.current;

    if (!element) return;

    const opt = {
      margin: 10,
      filename: 'tickets_report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: true
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      onClose();
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[800px] max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Export Tickets to PDF</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <button
            onClick={handleSelectAll}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {selectedTickets.length === tickets.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        <div className="flex-1 overflow-auto mb-4">
          {tickets.map(ticket => (
            <div
              key={ticket.id}
              className="flex items-center p-3 hover:bg-gray-50 border-b"
            >
              <input
                type="checkbox"
                checked={selectedTickets.includes(ticket.id)}
                onChange={() => handleTicketSelect(ticket.id)}
                className="mr-3"
              />
              <div>
                <div className="font-medium">{ticket.title}</div>
                <div className="text-sm text-gray-500">
                  {ticket.sender} - {ticket.date} {ticket.time}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={generatePdf}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={selectedTickets.length === 0}
          >
            Generate PDF
          </button>
        </div>

        {/* Hidden PDF content */}
        <div className="hidden">
          <div ref={pdfRef}>
            <PdfDocument tickets={tickets.filter(ticket => selectedTickets.includes(ticket.id))} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfExportModal;
