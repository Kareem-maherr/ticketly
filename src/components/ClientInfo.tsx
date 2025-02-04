import React from 'react';
import { FaCheck, FaLinkedin, FaInstagram, FaFacebook, FaYoutube, FaUser, FaTicketAlt, FaCalendarAlt, FaCreditCard } from 'react-icons/fa';

interface ClientInfoProps {
  name: string;
  title: string;
  email: string;
  imageUrl?: string;
  totalTickets?: number;
  activeTickets?: number;
  totalSpent?: number;
  accountStatus?: string;
}

const ClientInfo: React.FC<ClientInfoProps> = ({
  name = "Franklin",
  title = "Web Designer",
  email = "info@gmail.com",
  imageUrl = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  totalTickets = 24,
  activeTickets = 12,
  totalSpent = 2860,
  accountStatus = "Active"
}) => {
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

          {/* Stats */}

          {/* Social Links */}
          <div className="flex gap-2">
            <button className="text-blue-600 hover:text-blue-700">
              <FaLinkedin className="w-5 h-5" />
            </button>
            <button className="text-pink-600 hover:text-pink-700">
              <FaInstagram className="w-5 h-5" />
            </button>
            <button className="text-blue-800 hover:text-blue-900">
              <FaFacebook className="w-5 h-5" />
            </button>
            <button className="text-gray-700 hover:text-gray-800">
              <FaYoutube className="w-5 h-5" />
            </button>
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
              <p className="text-xl font-semibold text-gray-800">{totalTickets}</p>
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
              <p className="text-xl font-semibold text-gray-800">{activeTickets}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <FaCreditCard className="text-purple-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Spent</p>
              <p className="text-xl font-semibold text-gray-800">${totalSpent.toLocaleString()}</p>
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
              <p className="text-xl font-semibold text-gray-800">{accountStatus}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientInfo;
