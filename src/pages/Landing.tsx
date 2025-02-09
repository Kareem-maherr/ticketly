import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';

const Landing = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (role: 'client' | 'admin') => {
    try {
      setError('');
      setIsLoading(true);
      const result = await login(email, password);
      if (result) {
        const user = result.user;
        const token = await user.getIdToken();
        const isAdmin = user.email?.endsWith('@arabemerge.com') || false;
        
        if (role === 'admin' && !isAdmin) {
          setError('You do not have admin privileges. Only @arabemerge.com email addresses can access the admin panel.');
          return;
        }
        
        if (role === 'client' && isAdmin) {
          setError('Admin cannot login as client');
          return;
        }

        // Create or update user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          role: role,
          company: role === 'client' ? 'Arab Emergency' : 'Arabemerge',
          phone: '',
          address: '',
          website: '',
        }, { merge: true });

        navigate(role === 'admin' ? '/admin' : '/client');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8 w-full max-w-3xl"
      >
        <Logo className="w-80 h-auto mb-8 mx-auto" />
        <h1 className="text-5xl font-bold text-gray-800 mb-6">
          Welcome to Arab Emergency Ticketing System
        </h1>
        <p className="text-gray-600 text-xl max-w-2xl mx-auto">
          Streamlined support ticket management for better customer service
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md"
      >
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="space-y-4 pt-4">
            <button
              onClick={() => handleLogin('client')}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white rounded-lg px-6 py-3 text-lg font-semibold 
                       hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in as Client'}
            </button>
            
            <button
              onClick={() => handleLogin('admin')}
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white rounded-lg px-6 py-3 text-lg font-semibold 
                       hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in as Admin'}
            </button>
          </div>
        </form>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-8 text-sm text-gray-500"
      >
        {new Date().getFullYear()} ArabEmerge. All rights reserved.
      </motion.div>
    </div>
  );
};

export default Landing;
