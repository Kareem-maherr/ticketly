import React, { useEffect, useState } from 'react';
import { FaCalendarAlt, FaPlus, FaInfo } from 'react-icons/fa';
import { db } from '../config/firebase';
import { collection, onSnapshot, query, orderBy, where, Timestamp, Query } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import TicketDetails from './TicketDetails';


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
  ownerEmail: string;
  ownerId: string;
}

interface UpcomingEventsProps {
  onNewTicket: () => void;
  isAdmin: boolean;
  showResolved: boolean;
}


const severityStyles = {
  'Critical': 'bg-red-100 text-red-600',
  'High': 'bg-orange-100 text-orange-600',
  'Medium': 'bg-yellow-100 text-yellow-600',
  'Low': 'bg-green-100 text-green-600'
};

const statusStyles = {
  'Open': 'bg-blue-100 text-blue-600',
  'In Progress': 'bg-purple-100 text-purple-600',
  'Resolved': 'bg-green-100 text-green-600',
  'Closed': 'bg-gray-100 text-gray-600'
};

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ onNewTicket, isAdmin, showResolved }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showPastTickets, setShowPastTickets] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    let unsubscribe = () => {};

    const fetchTickets = () => {
      const ticketsRef = collection(db, 'tickets');
      let baseQuery: Query;

      if (auth.currentUser) {
        if (showResolved) {
          // Show resolved and closed tickets when viewing past tickets
          baseQuery = query(
            ticketsRef,
            where('ownerEmail', '==', auth.currentUser.email),
            where('status', 'in', ['Resolved', 'Closed']),
            orderBy('createdAt', 'desc')
          );
        } else {
          // Show only Open and In Progress tickets
          baseQuery = query(
            ticketsRef,
            where('ownerEmail', '==', auth.currentUser.email),
            where('status', 'in', ['Open', 'In Progress']),
            orderBy('createdAt', 'desc')
          );
        }
      } else {
        setTickets([]);
        setLoading(false);
        return;
      }

      unsubscribe = onSnapshot(baseQuery, (snapshot) => {
        const ticketData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Ticket));
        setTickets(ticketData);
        setLoading(false);
      }, (error) => {
        console.error('Error fetching tickets:', error);
        setLoading(false);
      });
    };

    fetchTickets();
    return () => unsubscribe();
  }, [isAdmin, auth.currentUser, showResolved]);


  const handleViewDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket);
  };

  const handleCloseDetails = () => {
    setSelectedTicket(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-gray-500">Loading tickets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">
            {isAdmin ? 'All Tickets' : 'My Tickets'}
          </h2>
          <button
            onClick={onNewTicket}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <FaPlus className="text-xs" />
            New Ticket
          </button>
        </div>

        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="flex items-center border-b border-gray-100 pb-4 last:border-0">
              <div className={`p-2 rounded-full ${severityStyles[ticket.severity]}`}>
                <FaCalendarAlt />
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-800">{ticket.title}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${severityStyles[ticket.severity]}`}>
                    {ticket.severity}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{ticket.date} • {ticket.time}</p>
                <p className="text-xs text-gray-500">{ticket.location}</p>
                {isAdmin && (
                  <p className="text-xs text-gray-500">From: {ticket.ownerEmail}</p>
                )}
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${statusStyles[ticket.status]}`}>
                  {ticket.status}
                </span>
                <button
                  onClick={() => handleViewDetails(ticket)}
                  className="text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <FaInfo className="text-lg" />
                </button>
              </div>
            </div>
          ))}
          {!loading && tickets.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              {isAdmin 
                ? 'No tickets found in the system.'
                : 'You haven\'t created any tickets yet. Create a new ticket to get started.'}
            </div>
          )}
        </div>
      </div>
      {selectedTicket && (
        <TicketDetails
          ticket={selectedTicket}
          onClose={handleCloseDetails}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
};

export default UpcomingEvents;