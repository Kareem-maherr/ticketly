import React from 'react'
import Sidebar from '../components/Sidebar'
import TicketList from '../components/TicketList'

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TicketList />
      </div>
    </div>
  )
}
