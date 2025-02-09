import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ClientDetails from '../components/ClientDetails';
import ClientInfo from '../components/ClientInfo';
import Sidebar from '../components/Sidebar';
import UpcomingEvents from '../components/UpcomingEvents';
import NewTicketModal from '../components/NewTicketModal';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface UserData {
  phone: string;
  email: string;
  address: string;
  website: string;
  company: string;
}

const Client = () => {
  const { currentUser } = useAuth();
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResolvedTickets, setShowResolvedTickets] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;

      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        } else {
          setError('User data not found');
        }
      } catch (err: any) {
        console.error('Error fetching user data:', err);
        setError(err.message);
      }
    };

    fetchUserData();
  }, [currentUser]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        isClientPage={true}
        onNewTicket={() => setIsNewTicketModalOpen(true)}
        onShowResolvedTickets={setShowResolvedTickets}
        ticketCounts={{
          Open: 0,
          "In Progress": 0,
          Resolved: 0,
        }}
      />

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto space-y-8">
        {userData && (
            <ClientInfo
              name={userData.company}
              title="Client"
              email={userData.email}
              totalTickets={24}
              activeTickets={12}
              totalSpent={2860}
              accountStatus="Active"
            />
          )}
          <div className="grid grid-cols-2 gap-8">
            {userData && (
              <ClientDetails
                phone={userData.phone}
                email={userData.email}
                address={userData.address}
                website={userData.website}
                company={userData.company}
                onUpdate={() => {
                  const fetchUserData = async () => {
                    if (!currentUser) return;

                    try {
                      const userDocRef = doc(db, 'users', currentUser.uid);
                      const userDoc = await getDoc(userDocRef);

                      if (userDoc.exists()) {
                        setUserData(userDoc.data() as UserData);
                      } else {
                        setError('User data not found');
                      }
                    } catch (err: any) {
                      console.error('Error fetching user data:', err);
                      setError(err.message);
                    }
                  };

                  fetchUserData();
                }}
              />
            )}
            
            <UpcomingEvents 
              onNewTicket={() => setIsNewTicketModalOpen(true)} 
              isAdmin={false}
              showResolved={showResolvedTickets}
            />
          </div>
        </div>
      </div>

      <NewTicketModal
        isOpen={isNewTicketModalOpen}
        onClose={() => setIsNewTicketModalOpen(false)}
        onSubmit={(ticketData) => {
          // Handle the ticket submission here
          console.log('New ticket:', ticketData);
          setIsNewTicketModalOpen(false);
        }}
        initialData={{
          title: '',
          sender: '',
          location: '',
          date: new Date().toISOString().split('T')[0],
          time: '',
          quantity: '',
          notes: '',
          severity: 'Low',
        }}
      />
    </div>
  );
};

export default Client;
