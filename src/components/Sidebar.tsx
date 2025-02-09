import React, { useEffect, useState } from 'react';
import { FaPlus, FaCircle, FaBell, FaUser, FaHistory, FaTicketAlt, FaSignOutAlt } from 'react-icons/fa';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isClientPage?: boolean;
  onNewTicket?: () => void;
  onFilterSelect?: (filter: string | null) => void;
  activeFilter?: string | null;
  ticketCounts: {
    Open: number;
    'In Progress': number;
    Resolved: number;
    Closed: number;
  };
  onShowResolvedTickets?: (show: boolean) => void;
}

export default function Sidebar({ 
  isClientPage = false, 
  onNewTicket, 
  onFilterSelect, 
  activeFilter, 
  ticketCounts,
  onShowResolvedTickets 
}: SidebarProps) {
  const auth = getAuth();
  const navigate = useNavigate();
  const currentUser = auth.currentUser;
  const { currentUser: authUser } = useAuth();
  const [resolvedCount, setResolvedCount] = useState(0);
  const [unresolvedCount, setUnresolvedCount] = useState(0);
  const [showingResolved, setShowingResolved] = useState(false);

  useEffect(() => {
    const fetchResolvedTicketsCount = async () => {
      if (!authUser) return;

      try {
        const ticketsRef = collection(db, 'tickets');
        const resolvedQuery = query(
          ticketsRef,
          where('ownerEmail', '==', authUser.email),
          where('status', 'in', ['Resolved', 'Closed'])
        );

        const unresolvedQuery = query(
          ticketsRef,
          where('ownerEmail', '==', authUser.email),
          where('status', 'in', ['Open', 'In Progress'])
        );

        const [resolvedSnapshot, unresolvedSnapshot] = await Promise.all([
          getCountFromServer(resolvedQuery),
          getCountFromServer(unresolvedQuery)
        ]);

        setResolvedCount(resolvedSnapshot.data().count);
        setUnresolvedCount(unresolvedSnapshot.data().count);
      } catch (error) {
        console.error('Error fetching tickets count:', error);
      }
    };

    fetchResolvedTicketsCount();
  }, [authUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  const handleFilterClick = (status: string) => {
    if (onFilterSelect) {
      if (activeFilter === status) {
        onFilterSelect(null);
      } else {
        onFilterSelect(status);
      }
    }
  };

  const handlePastTicketsClick = () => {
    setShowingResolved(true);
    if (onShowResolvedTickets) {
      onShowResolvedTickets(true);
    }
  };

  const handleCurrentTicketsClick = () => {
    setShowingResolved(false);
    if (onShowResolvedTickets) {
      onShowResolvedTickets(false);
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Logo Section */}
      <div className="p-5 border-b border-gray-200">
        <Logo />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 px-4 py-2 overflow-y-auto">
        {isClientPage ? (
          // Client Page Elements
          <div className="space-y-8">
            <div>
              <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider px-3">Account</h3>
              <ul className="space-y-1">
                <li className="flex items-center text-sm text-gray-700 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                  <FaUser className="mr-2.5 text-red-500 text-[14px]" />
                  <span className="font-medium">Account Details</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider px-3">Communication</h3>
              <ul className="space-y-1">
                <li className="flex items-center text-sm text-gray-700 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                  <FaHistory className="mr-2.5 text-red-500 text-[14px]" />
                  <span className="font-medium">Past Messages</span>
                  <span className="ml-auto bg-gray-50 px-2 py-0.5 rounded-lg text-xs text-gray-500">3</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider px-3">Tickets</h3>
              <ul className="space-y-1">
                <li 
                  onClick={handlePastTicketsClick}
                  className={`flex items-center text-sm text-gray-700 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors
                    ${showingResolved ? 'bg-gray-50' : ''}`}
                >
                  <FaTicketAlt className="mr-2.5 text-red-500 text-[14px]" />
                  <span className="font-medium">Past Tickets</span>
                  <span className="ml-auto bg-gray-50 px-2 py-0.5 rounded-lg text-xs text-gray-500">
                    {resolvedCount}
                  </span>
                </li>
                <li 
                  onClick={handleCurrentTicketsClick}
                  className={`flex items-center text-sm text-gray-700 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors
                    ${!showingResolved ? 'bg-gray-50' : ''}`}
                >
                  <FaTicketAlt className="mr-2.5 text-green-500 text-[14px]" />
                  <span className="font-medium">Current Tickets</span>
                  <span className="ml-auto bg-gray-50 px-2 py-0.5 rounded-lg text-xs text-gray-500">
                    {unresolvedCount}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          // Admin Page Elements - Status and Priority sections remain unchanged
          <>
            <div className="mb-8">
              <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider px-3">Ticket Status</h3>
              <ul className="space-y-1">
                <li className="flex items-center text-sm text-gray-700 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors" onClick={() => handleFilterClick('Open')}>
                  <FaCircle className="mr-2.5 text-red-500 text-[10px]" />
                  <span className="font-medium">Open</span>
                  <span className="ml-auto bg-gray-50 px-2 py-0.5 rounded-lg text-xs text-gray-500">{ticketCounts.Open}</span>
                </li>
                <li className="flex items-center text-sm text-gray-700 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors" onClick={() => handleFilterClick('In Progress')}>
                  <FaCircle className="mr-2.5 text-red-400 text-[10px]" />
                  <span className="font-medium">In Progress</span>
                  <span className="ml-auto bg-gray-50 px-2 py-0.5 rounded-lg text-xs text-gray-500">{ticketCounts['In Progress']}</span>
                </li>
                <li className="flex items-center text-sm text-gray-700 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors" onClick={() => handleFilterClick('Resolved')}>
                  <FaCircle className="mr-2.5 text-red-300 text-[10px]" />
                  <span className="font-medium">Resolved</span>
                  <span className="ml-auto bg-gray-50 px-2 py-0.5 rounded-lg text-xs text-gray-500">{ticketCounts.Resolved}</span>
                </li>
                <li className="flex items-center text-sm text-gray-700 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors" onClick={() => handleFilterClick('Closed')}>
                  <FaCircle className="mr-2.5 text-gray-300 text-[10px]" />
                  <span className="font-medium">Closed</span>
                  <span className="ml-auto bg-gray-50 px-2 py-0.5 rounded-lg text-xs text-gray-500">{ticketCounts.Closed}</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider px-3">Priority</h3>
              <ul className="space-y-1">
                <li className="flex items-center text-sm text-gray-700 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                  <FaCircle className="mr-2.5 text-red-600 text-[10px]" />
                  <span className="font-medium">Critical</span>
                  <span className="ml-auto bg-gray-50 px-2 py-0.5 rounded-lg text-xs text-gray-500">3</span>
                </li>
                <li className="flex items-center text-sm text-gray-700 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                  <FaCircle className="mr-2.5 text-red-500 text-[10px]" />
                  <span className="font-medium">High</span>
                  <span className="ml-auto bg-gray-50 px-2 py-0.5 rounded-lg text-xs text-gray-500">7</span>
                </li>
                <li className="flex items-center text-sm text-gray-700 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                  <FaCircle className="mr-2.5 text-red-400 text-[10px]" />
                  <span className="font-medium">Medium</span>
                  <span className="ml-auto bg-gray-50 px-2 py-0.5 rounded-lg text-xs text-gray-500">10</span>
                </li>
                <li className="flex items-center text-sm text-gray-700 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                  <FaCircle className="mr-2.5 text-red-300 text-[10px]" />
                  <span className="font-medium">Low</span>
                  <span className="ml-auto bg-gray-50 px-2 py-0.5 rounded-lg text-xs text-gray-500">8</span>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>

      {/* User Profile Preview */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center text-red-600 font-medium">
              {currentUser?.email?.[0].toUpperCase() || (isClientPage ? 'C' : 'A')}
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900">
                {currentUser?.email || (isClientPage ? 'Client' : 'Admin')}
              </div>
              <div className="text-xs text-gray-500">
                {isClientPage ? 'Client Account' : 'Admin Account'}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Logout"
          >
            <FaSignOutAlt />
          </button>
        </div>
      </div>
    </div>
  );
}