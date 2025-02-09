import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import TicketList from "../components/TicketList";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../config/firebase";

interface TicketCounts {
  Open: number;
  "In Progress": number;
  Resolved: number;
}

export default function Dashboard() {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [ticketCounts, setTicketCounts] = useState<TicketCounts>({
    Open: 0,
    "In Progress": 0,
    Resolved: 0,
  });

  useEffect(() => {
    const ticketsRef = collection(db, "tickets");
    const q = query(ticketsRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const counts: TicketCounts = {
        Open: 0,
        "In Progress": 0,
        Resolved: 0,
      };

      snapshot.forEach((doc) => {
        const ticket = doc.data();
        if (ticket.status in counts) {
          counts[ticket.status as keyof TicketCounts]++;
        }
      });

      setTicketCounts(counts);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        onFilterSelect={setSelectedFilter}
        activeFilter={selectedFilter}
        ticketCounts={ticketCounts}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <TicketList filter={selectedFilter} />
      </div>
    </div>
  );
}
