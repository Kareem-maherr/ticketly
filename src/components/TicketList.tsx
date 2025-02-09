import React, { useState, useEffect } from 'react';
import { FaFilter, FaMapMarkerAlt, FaFilePdf } from 'react-icons/fa';
import TicketDetails from './TicketDetails';
import PdfExportModal from './PdfExportModal';
import generateOpenTicketsPdf from './OpenTicketsPdf';
import { db } from '../config/firebase';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

interface Ticket {
  id: string;
  title: string;
  sender: string;
  location: string;
  date: string;
  time: string;
  severity: string;
  status: string;
  quantity: string;
  notes: string;
  createdAt: Timestamp;
}

interface TicketListProps {
  filter: string | null;
}


const priorityStyles: { [key: string]: string } = {
  'Critical': 'bg-red-100 text-red-800',
  'High': 'bg-orange-100 text-orange-800',
  'Medium': 'bg-yellow-100 text-yellow-800',
  'Low': 'bg-green-100 text-green-800'
};

const statusStyles: { [key: string]: string } = {
  'Open': 'bg-blue-100 text-blue-800',
  'In Progress': 'bg-purple-100 text-purple-800',
  'Resolved': 'bg-green-100 text-green-800'
};

export default function TicketList({ filter }: TicketListProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const auth = getAuth();

  const filteredTickets = React.useMemo(() => {
    // By default, hide resolved tickets unless specifically filtered
    if (!filter) {
      return tickets.filter(ticket => ticket.status !== 'Resolved');
    }
    // When a filter is selected, show only tickets matching that status
    return tickets.filter(ticket => ticket.status === filter);
  }, [tickets, filter]);

  useEffect(() => {
    const ticketsRef = collection(db, 'tickets');
    const q = query(ticketsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ticketData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Ticket));
      setTickets(ticketData);
    });

    return () => unsubscribe();
  }, []);

  const handleExportPdf = async () => {
    try {
      await generateOpenTicketsPdf(tickets);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="flex-1 bg-gray-50 overflow-hidden flex flex-col">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-medium">
            {filter ? `${filter} Tickets` : 'All Active Tickets'}
            </h1>
            <div className="text-sm text-gray-500">
              <span>{filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="flex items-center px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              <FaFilePdf className="mr-2" />
              Export PDF
            </button>
            <button 
              onClick={handleExportPdf}
              className="flex items-center px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              <FaFilePdf className="mr-2" />
              Export Open Tickets
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sender</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-gray-50 cursor-pointer">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{ticket.title}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{ticket.sender}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-500">
                    <FaMapMarkerAlt className="mr-1.5 text-red-500" />
                    {ticket.location}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${priorityStyles[ticket.severity]}`}>
                    {ticket.severity}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[ticket.status]}`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 truncate max-w-xs">{ticket.notes}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{ticket.date} • {ticket.time}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => setSelectedTicket(ticket)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTickets.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {filter ? `No ${filter.toLowerCase()} tickets found.` : 'No active tickets found.'}
          </div>
        )}
      </div>

      {selectedTicket && (
        <TicketDetails 
          ticket={selectedTicket} 
          onClose={() => setSelectedTicket(null)} 
          isAdmin={auth.currentUser?.email?.endsWith('@arabemerge.com') || false}
        />
      )}
      <PdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        tickets={tickets}
      />
    </div>
  );
}
