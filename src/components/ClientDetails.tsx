import React, { useState } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaGlobe, FaBuilding, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface ClientDetailsProps {
  phone: string;
  email: string;
  address: string;
  website: string;
  company: string;
  onUpdate: () => void;
}

const API_URL = 'http://localhost:8000';

const ClientDetails: React.FC<ClientDetailsProps> = ({ 
  phone: initialPhone, 
  email: initialEmail, 
  address: initialAddress, 
  website: initialWebsite, 
  company: initialCompany,
  onUpdate 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    phone: initialPhone,
    email: initialEmail,
    address: initialAddress,
    website: initialWebsite,
    company: initialCompany
  });

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    setError('');

    try {
      const token = await currentUser.getIdToken();
      await axios.put(
        `${API_URL}/auth/users/me`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setIsEditing(false);
      onUpdate(); // Refresh parent component data
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.detail || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      phone: initialPhone,
      email: initialEmail,
      address: initialAddress,
      website: initialWebsite,
      company: initialCompany
    });
    setIsEditing(false);
    setError('');
  };

  const renderField = (icon: JSX.Element, label: string, field: keyof typeof formData, bgColor: string, textColor: string) => (
    <div className="flex items-center">
      <div className={`${bgColor} p-2 rounded-full`}>
        {React.cloneElement(icon, { className: textColor })}
      </div>
      <div className="ml-4 flex-grow">
        <p className="text-sm text-gray-500">{label}</p>
        {isEditing ? (
          <input
            type="text"
            value={formData[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <p className="text-sm font-medium text-gray-800">{formData[field]}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Client Details</h2>
        {isEditing ? (
          <div className="space-x-2">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center space-x-2 disabled:opacity-50"
            >
              <FaSave className="w-4 h-4" />
              <span>{isLoading ? 'Saving...' : 'Save'}</span>
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="text-gray-600 hover:text-gray-700 px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center space-x-2"
            >
              <FaTimes className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-600 hover:text-blue-700 px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center space-x-2"
          >
            <FaEdit className="w-4 h-4" />
            <span>Edit</span>
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {renderField(<FaPhone />, 'Phone', 'phone', 'bg-blue-100', 'text-blue-600')}
          {renderField(<FaEnvelope />, 'Email', 'email', 'bg-green-100', 'text-green-600')}
          {renderField(<FaMapMarkerAlt />, 'Address', 'address', 'bg-purple-100', 'text-purple-600')}
          {renderField(<FaGlobe />, 'Website', 'website', 'bg-orange-100', 'text-orange-600')}
          {renderField(<FaBuilding />, 'Company', 'company', 'bg-pink-100', 'text-pink-600')}
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;
