import React, { useEffect, useState } from 'react';
import { FaCheck, FaLinkedin, FaInstagram, FaFacebook, FaYoutube, FaUser, FaTicketAlt, FaCalendarAlt, FaCreditCard } from 'react-icons/fa';
import { db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

interface ClientInfoProps {
  name: string;
  title: string;
  email: string;
  imageUrl?: string;
}

const ClientInfo: React.FC<ClientInfoProps> = ({
  name = "Franklin",
  title = "Web Designer",
  email = "info@gmail.com",
  imageUrl = "/pdfSVG.svg"
}) => {

  const { currentUser } = useAuth();
  const [ticketStats, setTicketStats] = useState({
    totalTickets: 0,
    activeTickets: 0,
    totalSpent: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTicketStats = async () => {
      if (!currentUser) return;

      try {
        const ticketsRef = collection(db, 'tickets');
        const userTicketsQuery = query(
          ticketsRef,
          where('ownerEmail', '==', currentUser.email)
        );

        const querySnapshot = await getDocs(userTicketsQuery);
        let active = 0;
        let total = 0;
        let spent = 0;

        querySnapshot.forEach((doc) => {
          const ticket = doc.data();
          total++;
          // Consider tickets as active if they're not resolved
          if (ticket.status !== 'Resolved') {
            active++;
          }
          // If you have a cost field in your tickets, you can sum it here
          // For now, we'll assume each ticket costs $100 as an example
          spent += 100; // Replace this with actual cost calculation if available
        });

        setTicketStats({
          totalTickets: total,
          activeTickets: active,
          totalSpent: spent
        });
      } catch (error) {
        console.error('Error fetching ticket stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTicketStats();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg p-6 shadow-sm animate-pulse">
          <div className="h-16 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          {/* Profile Image and Info */}
          <div className="flex items-center gap-4 flex-1">
            <div className="relative">
              <img
                src={imageUrl}
                alt={name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-gray-900">{name}</h2>
                <span className="bg-blue-600 p-0.5 rounded-full">
                  <FaCheck className="text-white text-xs" />
                </span>
              </div>
              <p className="text-gray-600 text-sm">{title}</p>
              <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                <span>•</span>
                <span>{email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <FaTicketAlt className="text-blue-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Tickets</p>
              <p className="text-xl font-semibold text-gray-800">{ticketStats.totalTickets}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <FaCalendarAlt className="text-green-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Active Tickets</p>
              <p className="text-xl font-semibold text-gray-800">{ticketStats.activeTickets}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <FaCreditCard className="text-purple-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">TEMPLATE CARD</p>
              <p className="text-xl font-semibold text-gray-800">0</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="bg-orange-100 p-3 rounded-full">
              <FaUser className="text-orange-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Account Status</p>
              <p className="text-xl font-semibold text-gray-800">Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientInfo;
