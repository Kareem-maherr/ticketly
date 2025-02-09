import React from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaGlobe, FaBuilding } from 'react-icons/fa';

interface ClientDetailsProps {
  phone: string;
  email: string;
  address: string;
  website: string;
  company: string;
}

const ClientDetails: React.FC<ClientDetailsProps> = ({ 
  phone,
  email, 
  address, 
  website, 
  company
}) => {
  const renderField = (icon: JSX.Element, label: string, value: string, bgColor: string, textColor: string) => (
    <div className="flex items-center">
      <div className={`${bgColor} p-2 rounded-full`}>
        {React.cloneElement(icon, { className: textColor })}
      </div>
      <div className="ml-4 flex-grow">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Client Details</h2>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-4">
          {renderField(<FaPhone />, 'Phone', phone, 'bg-blue-100', 'text-blue-600')}
          {renderField(<FaEnvelope />, 'Email', email, 'bg-green-100', 'text-green-600')}
          {renderField(<FaMapMarkerAlt />, 'Address', address, 'bg-purple-100', 'text-purple-600')}
          {renderField(<FaGlobe />, 'Website', website, 'bg-orange-100', 'text-orange-600')}
          {renderField(<FaBuilding />, 'Company', company, 'bg-pink-100', 'text-pink-600')}
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;